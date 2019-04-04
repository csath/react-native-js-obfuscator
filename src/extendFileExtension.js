export default function extendFileExtension(filename, extensionPart) {
  const parts = filename.split('.');
  parts.splice(1, 0, extensionPart);
  return parts.join('.');
}
