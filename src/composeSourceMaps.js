import { SourceMapConsumer, SourceMapGenerator } from 'source-map';

export function convertMetroRawSourceMapToStandardSourceMap(
  map,
  originalFileName,
  originalFileContent,
) {
  const outputMap = new SourceMapGenerator();

  outputMap.setSourceContent(originalFileName, originalFileContent);

  map.forEach((args) => {
    const [generatedLine, generatedColumn, originalLine, originalColumn] = args;
    outputMap.addMapping({
      generated: {
        line: generatedLine,
        column: generatedColumn,
      },
      original: {
        line: originalLine,
        column: originalColumn,
      },
      source: originalFileName,
      name: args.length === 5 ? (args[4]) : undefined,
    });
  });

  return outputMap.toString();
}

export function convertStandardSourceMapToMetroRawSourceMap(
  map,
) {
  const consumer = new SourceMapConsumer(map); // upstream types are wrong

  const outputMap = [];

  consumer.eachMapping((mapping) => {
    outputMap.push([
      mapping.generatedLine,
      mapping.generatedColumn,
      mapping.originalLine,
      mapping.originalColumn,
      mapping.name,
    ]);
  });

  return outputMap;
}

export function composeSourceMaps(
  sourceMap,
  targetMap,
  sourceFileName,
  sourceContent,
) {
  const tsConsumer = new SourceMapConsumer(sourceMap); // upstreeam types are wrong
  const babelConsumer = new SourceMapConsumer(targetMap);
  const map = new SourceMapGenerator();
  map.setSourceContent(sourceFileName, sourceContent);
  babelConsumer.eachMapping(
    ({
      generatedLine,
      generatedColumn,
      originalLine,
      originalColumn,
      name,
    }) => {
      if (originalLine) {
        const original = tsConsumer.originalPositionFor({
          line: originalLine,
          column: originalColumn,
        });
        if (original.line) {
          map.addMapping({
            generated: {
              line: generatedLine,
              column: generatedColumn,
            },
            original: {
              line: original.line,
              column: original.column,
            },
            source: sourceFileName,
            name,
          });
        }
      }
    },
  );
  return map.toString();
}
