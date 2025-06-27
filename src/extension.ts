import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "flutter-tools-plus.createBarrel",
    async (uri: vscode.Uri) => {
      const folderPath = uri.fsPath;

      // Obtener el nombre de la carpeta como nombre del archivo
      const folderName = path.basename(folderPath);
      const barrelFileName = `${folderName}.dart`;
      const barrelFilePath = path.join(folderPath, barrelFileName);

      const allFiles = collectDartFiles(folderPath);

      // Excluir el archivo barril actual (si existe)
      const filteredFiles = allFiles.filter(
        (f) => path.basename(f) !== barrelFileName
      );

      // Crear línea por cada export
      const exportLines = filteredFiles.map((file) => {
        const relative = path.relative(folderPath, file).replace(/\\/g, "/");
        return `export '${relative}';`;
      });

      // Guardar contenido en el archivo
      const content = exportLines.join("\n") + "\n";
      fs.writeFileSync(barrelFilePath, content);

      vscode.window.showInformationMessage(
        `✅ ${barrelFileName} creado/actualizado en ${folderPath}`
      );
    }
  );

  context.subscriptions.push(disposable);
}

function collectDartFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(collectDartFiles(fullPath));
    } else if (file.endsWith(".dart")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function deactivate() {}
