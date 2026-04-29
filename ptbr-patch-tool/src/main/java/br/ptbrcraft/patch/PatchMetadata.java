package br.ptbrcraft.patch;

import java.util.List;
import java.util.Arrays;
import java.util.Collections;

public final class PatchMetadata {
    public static final String APP_NAME = "PATCH 1.1.0 PTBRCRAFT";

    public static final List<String> REMOVAL_PREFIXES = Collections.unmodifiableList(Arrays.asList(
            "EggsZombies",
            "zombieawareness",
            "spawnanimations",
            "ScalingMobs",
            "sanitydim",
            "champions"
    ));

    public static final List<String> ADDITION_MODS = Collections.unmodifiableList(Arrays.asList(
            "Just-Enough-Botania-1.20.1-v0.2.1.jar",
            "create_netherless-2.0.0-1.20.1.jar",
            "create-food-1.20.1-1.1.13a-forge.jar",
            "create_central_kitchen-1.20.1-for-create-6.0.4-1.4.1.jar",
            "more-immersive-wires-1.20.1-1.1.4.jar",
            "balm-forge-1.20.1-7.3.38-all.jar",
            "inventoryessentials-forge-1.20.1-8.2.15.jar",
            "mechanicalbotania-1.0.2.jar",
            "ImmersiveEngineering-1.20.1-10.1.0-171.jar",
            "Botania-1.20.1-446-FORGE.jar",
            "txnilib-forge-1.0.24-1.20.1.jar",
            "OctoLib-FORGE-0.4.2+1.20.1.jar",
            "ImmersiveUI-FORGE-0.3.0.jar",
            "OverflowingBars-v8.0.1-1.20.1-Forge.jar",
            "immersivearmorhud-forge-1.0.1-1.20.1.jar",
            "Quick Skin - Forge - 1.20.1-2.6.2.4.jar"
    ));

    private PatchMetadata() {
    }
}
