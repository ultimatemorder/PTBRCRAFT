package br.ptbrcraft.patch;

import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;
import javax.swing.SwingWorker;
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Image;
import java.nio.file.Paths;
import java.util.Objects;

public class PatchApplication {
    private final PatchService patchService = new PatchService();
    private final JTextField pathField = new JTextField(52);
    private final JTextArea outputArea = new JTextArea(20, 74);
    private final JButton applyButton = new JButton("Aplicar patch");

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new PatchApplication().start());
    }

    private void start() {
        JFrame frame = new JFrame(PatchMetadata.APP_NAME);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new BorderLayout(10, 10));
        setIcon(frame);

        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JLabel pathLabel = new JLabel("Pasta da instalacao:");
        JButton browseButton = new JButton("Selecionar pasta");
        browseButton.addActionListener(e -> chooseFolder(frame));
        applyButton.addActionListener(e -> applyPatch(frame));

        topPanel.add(pathLabel);
        topPanel.add(pathField);
        topPanel.add(browseButton);
        topPanel.add(applyButton);

        outputArea.setEditable(false);
        outputArea.setLineWrap(true);
        outputArea.setWrapStyleWord(true);
        JScrollPane scrollPane = new JScrollPane(outputArea);

        frame.add(topPanel, BorderLayout.NORTH);
        frame.add(scrollPane, BorderLayout.CENTER);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void setIcon(JFrame frame) {
        try {
            Image icon = javax.imageio.ImageIO.read(Objects.requireNonNull(
                    PatchApplication.class.getResourceAsStream("/app-icon.png")));
            frame.setIconImage(icon);
        } catch (Exception ignored) {
        }
    }

    private void chooseFolder(JFrame frame) {
        JFileChooser chooser = new JFileChooser();
        chooser.setDialogTitle("Selecione a pasta da instalacao do modpack");
        chooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
        int result = chooser.showOpenDialog(frame);
        if (result == JFileChooser.APPROVE_OPTION) {
            pathField.setText(chooser.getSelectedFile().toPath().toString());
        }
    }

    private void applyPatch(JFrame frame) {
        String selectedPath = pathField.getText().trim();
        if (selectedPath.isEmpty()) {
            JOptionPane.showMessageDialog(frame, "Selecione uma pasta antes de aplicar o patch.");
            return;
        }

        applyButton.setEnabled(false);
        outputArea.setText("Executando " + PatchMetadata.APP_NAME + "...\n");

        SwingWorker<PatchResult, Void> worker = new SwingWorker<PatchResult, Void>() {
            @Override
            protected PatchResult doInBackground() throws Exception {
                return patchService.apply(Paths.get(selectedPath));
            }

            @Override
            protected void done() {
                applyButton.setEnabled(true);
                try {
                    PatchResult result = get();
                    outputArea.setText(result.getChangelog());
                    if (result.isAlreadyApplied()) {
                        JOptionPane.showMessageDialog(frame, "Patch ja estava aplicado.");
                    } else {
                        JOptionPane.showMessageDialog(frame, "Patch aplicado com sucesso.");
                    }
                } catch (Exception ex) {
                    outputArea.append("\n\nErro: " + ex.getMessage());
                    JOptionPane.showMessageDialog(frame, "Falha ao aplicar patch: " + ex.getMessage());
                }
            }
        };
        worker.execute();
    }
}
