package br.ptbrcraft.patch;

import java.util.List;

public class PatchResult {
    private final boolean alreadyApplied;
    private final List<String> removedMods;
    private final List<String> addedMods;
    private final String changelog;

    public PatchResult(boolean alreadyApplied, List<String> removedMods, List<String> addedMods, String changelog) {
        this.alreadyApplied = alreadyApplied;
        this.removedMods = removedMods;
        this.addedMods = addedMods;
        this.changelog = changelog;
    }

    public boolean isAlreadyApplied() {
        return alreadyApplied;
    }

    public List<String> getRemovedMods() {
        return removedMods;
    }

    public List<String> getAddedMods() {
        return addedMods;
    }

    public String getChangelog() {
        return changelog;
    }
}
