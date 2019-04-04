
import { SourceMapConsumer } from 'source-map';
import * as semver from 'semver';
import * as babylon from 'babylon';
import traverse from 'babel-traverse';

import {
  convertStandardSourceMapToMetroRawSourceMap,
} from './composeSourceMaps';


function getReactNativeMinorVersion() {
  const reactNativeVersionString = require('react-native/package.json').version;
  const parseResult = semver.parse(reactNativeVersionString);
  if (!parseResult) {
    throw new Error(
      `Can't parse react-native version string '${reactNativeVersionString}'`,
    );
  }
  return parseResult.minor;
}

export function getMetroTransformer(
  reactNativeMinorVersion = getReactNativeMinorVersion(),
) {
  if (reactNativeMinorVersion >= 56) {
    return require('metro/src/reactNativeTransformer');
  } else if (reactNativeMinorVersion >= 52) {
    return require('metro/src/transformer');
  } else if (reactNativeMinorVersion >= 0.47) {
    return require('metro-bundler/src/transformer');
  } else if (reactNativeMinorVersion === 0.46) {
    return require('metro-bundler/build/transformer');
  } else {
    throw new Error(
      'requires react-native >= 0.46 to do obfuscation',
    );
  }
}

export function maybeTransformMetroResult(
  upstreamResult,
  { code, map },
  reactNativeMinorVersion = getReactNativeMinorVersion(),
) {
  if (reactNativeMinorVersion >= 52) {
    // convert code and map to ast
    const ast = babylon.parse(code, {
      sourceType: 'module',
    });
    const mapConsumer = new SourceMapConsumer(map); // upstream types are wrong
    (traverse).cheap(ast, (node) => {
      if (node.loc) {
        const originalStart = mapConsumer.originalPositionFor(node.loc.start);
        if (originalStart.line) {
          node.loc.start.line = originalStart.line;
          node.loc.start.column = originalStart.column;
        }
        const originalEnd = mapConsumer.originalPositionFor(node.loc.end);
        if (originalEnd.line) {
          node.loc.end.line = originalEnd.line;
          node.loc.end.column = originalEnd.column;
        }
      }
    });
    return { ast };
  } else if (Array.isArray(upstreamResult.map)) {
    return { code, map: convertStandardSourceMapToMetroRawSourceMap(map) };
  } else {
    return { code, map };
  }
}
