import * as Obfuscator from 'javascript-obfuscator';
import {
  convertMetroRawSourceMapToStandardSourceMap,
  composeSourceMaps,
} from './composeSourceMaps';

export function obfuscateCode(
  code,
  options,
) {
  return Obfuscator.obfuscate(code, options).getObfuscatedCode();
}

export function obfuscateCodePreservingSourceMap(
  code,
  map,
  originlFilename,
  originalSource,
  options,
) {
  const obfuscationResult = Obfuscator.obfuscate(code, options);
  const obfuscationResultMap = obfuscationResult.getSourceMap();

  if (!obfuscationResultMap) {
    throw new Error(
      `javascript-obfuscator did not return a source map for file ${originlFilename}`,
    );
  }

  if (Array.isArray(map)) {
    map = convertMetroRawSourceMapToStandardSourceMap(
      map,
      originlFilename,
      originalSource,
    );
  }

  return {
    code: obfuscationResult.getObfuscatedCode(),
    map: composeSourceMaps(
      map,
      obfuscationResultMap,
      originlFilename,
      originalSource,
    ),
  };
}
