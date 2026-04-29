package br.ptbrcraft.patch;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class PatchService {
    public PatchResult apply(Path instanceDir) throws IOException {
        Path modsDir = instanceDir.resolve("mods");
        Path configDir = instanceDir.resolve("config");
        validate(modsDir, configDir, instanceDir);

        Map<String, Path> existingModFiles = listModFiles(modsDir);
        List<String> removable = resolveRemovables(existingModFiles);
        List<String> missingAdditions = resolveMissingAdditions(existingModFiles);

        if (removable.isEmpty() && missingAdditions.isEmpty()) {
            String changelog = buildAlreadyAppliedChangelog();
            return new PatchResult(true, Collections.<String>emptyList(), Collections.<String>emptyList(), changelog);
        }

        List<String> removed = removeFiles(removable, existingModFiles);
        List<String> added = addMods(modsDir);
        syncFancyMenu(configDir.resolve("fancymenu"));
        String changelog = buildAppliedChangelog(removed, added);
        return new PatchResult(false, removed, added, changelog);
    }

    private void validate(Path modsDir, Path configDir, Path instanceDir) {
        if (!Files.isDirectory(instanceDir)) {
            throw new IllegalArgumentException("A pasta selecionada nao existe.");
        }
        if (!Files.isDirectory(modsDir) || !Files.isDirectory(configDir)) {
            throw new IllegalArgumentException("Pasta invalida. A raiz precisa conter as pastas mods e config.");
        }
    }

    private Map<String, Path> listModFiles(Path modsDir) throws IOException {
        Map<String, Path> modFiles = new TreeMap<>(String.CASE_INSENSITIVE_ORDER);
        try (Stream<Path> paths = Files.list(modsDir)) {
            paths.filter(Files::isRegularFile).forEach(path -> modFiles.put(path.getFileName().toString(), path));
        }
        return modFiles;
    }

    private List<String> resolveRemovables(Map<String, Path> existingModFiles) {
        List<String> found = new ArrayList<>();
        for (String filename : existingModFiles.keySet()) {
            String normalized = filename.toLowerCase(Locale.ROOT);
            for (String prefix : PatchMetadata.REMOVAL_PREFIXES) {
                if (normalized.startsWith(prefix.toLowerCase(Locale.ROOT))) {
                    found.add(filename);
                    break;
                }
            }
        }
        found.sort(String.CASE_INSENSITIVE_ORDER);
        return found;
    }

    private List<String> resolveMissingAdditions(Map<String, Path> existingModFiles) {
        List<String> missing = new ArrayList<>();
        for (String required : PatchMetadata.ADDITION_MODS) {
            if (!existingModFiles.containsKey(required)) {
                missing.add(required);
            }
        }
        return missing;
    }

    private List<String> removeFiles(List<String> removable, Map<String, Path> existingModFiles) throws IOException {
        List<String> removed = new ArrayList<>();
        for (String filename : removable) {
            Path toRemove = existingModFiles.get(filename);
            if (toRemove != null && Files.exists(toRemove)) {
                Files.delete(toRemove);
                removed.add(filename);
            }
        }
        removed.sort(String.CASE_INSENSITIVE_ORDER);
        return removed;
    }

    private List<String> addMods(Path modsDir) throws IOException {
        List<String> added = new ArrayList<>();
        for (String modName : PatchMetadata.ADDITION_MODS) {
            String resourcePath = "/patch/mods/" + modName;
            try (InputStream in = PatchService.class.getResourceAsStream(resourcePath)) {
                if (in == null) {
                    throw new IOException("Recurso do mod nao encontrado no patch: " + modName);
                }
                Path destination = modsDir.resolve(modName);
                Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
                added.add(modName);
            }
        }
        return added;
    }

    private void syncFancyMenu(Path fancymenuDir) throws IOException {
        Files.createDirectories(fancymenuDir);
        try (InputStream zipStream = PatchService.class.getResourceAsStream("/patch/fancymenu.zip")) {
            if (zipStream == null) {
                throw new IOException("Recurso de menu nao encontrado no patch.");
            }
            try (ZipInputStream zipInputStream = new ZipInputStream(zipStream)) {
                ZipEntry entry;
                while ((entry = zipInputStream.getNextEntry()) != null) {
                    Path destination = fancymenuDir.resolve(entry.getName()).normalize();
                    if (!destination.startsWith(fancymenuDir.normalize())) {
                        throw new IOException("Entrada invalida no pacote de menu: " + entry.getName());
                    }
                    if (entry.isDirectory()) {
                        Files.createDirectories(destination);
                    } else {
                        Files.createDirectories(destination.getParent());
                        Files.copy(zipInputStream, destination, StandardCopyOption.REPLACE_EXISTING);
                    }
                }
            }
        }
    }

    private String buildAlreadyAppliedChangelog() {
        StringBuilder sb = new StringBuilder();
        sb.append(PatchMetadata.APP_NAME).append('\n');
        sb.append("Status: patch ja aplicado").append('\n');
        sb.append('\n');
        sb.append("Removidos (padroes):").append('\n');
        for (String pattern : PatchMetadata.REMOVAL_PREFIXES) {
            sb.append("- ").append(pattern).append('*').append('\n');
        }
        sb.append('\n');
        sb.append("Adicionados:").append('\n');
        for (String mod : PatchMetadata.ADDITION_MODS) {
            sb.append("- ").append(mod).append('\n');
        }
        sb.append('\n');
        sb.append("Menu personalizado: nenhuma alteracao necessaria");
        return sb.toString();
    }

    private String buildAppliedChangelog(List<String> removed, List<String> added) {
        List<String> sortedAdded = new ArrayList<>(added);
        sortedAdded.sort(String.CASE_INSENSITIVE_ORDER);

        StringBuilder sb = new StringBuilder();
        sb.append(PatchMetadata.APP_NAME).append('\n');
        sb.append("Status: patch aplicado com sucesso").append('\n');
        sb.append('\n');
        sb.append("Removidos: ").append(removed.size()).append('\n');
        if (removed.isEmpty()) {
            sb.append("- Nenhum arquivo removido").append('\n');
        } else {
            for (String removedFile : removed) {
                sb.append("- ").append(removedFile).append('\n');
            }
        }
        sb.append('\n');
        sb.append("Adicionados/atualizados: ").append(sortedAdded.size()).append('\n');
        for (String addedFile : sortedAdded) {
            sb.append("- ").append(addedFile).append('\n');
        }
        sb.append('\n');
        sb.append("Menu personalizado: config/fancymenu sincronizado");
        return sb.toString();
    }
}
