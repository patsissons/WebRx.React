/// <reference path="./Extensions.d.ts"/>

'use strict';

import './Object';

function isNullOrEmpty(value: string) {
  return value == null || value === '';
}

function stringify(value: any, replacer?: any, space: string | number = 2) {
  let result: string = null;

  if (value != null) {
    result = value.toString();

    if (result === '[object Object]') {
      result = Object.getName(value);

      if (result === 'Object') {
        try {
          result = JSON.stringify(value, replacer, space);
        } catch (e) {
          console.warn('Attempt to stringify failed');
          console.log(e);
        }
      }
    }
  }

  return result;
}

function format(format: string, ...args: any[]) {
  if (format != null) {
    format = format.replace(/\{\d+\}/g, x => stringify(args[parseInt(x.match(/\d+/)[0])]));
  }

  return format;
}

String.isNullOrEmpty = Object.getValueOrDefault(String.isNullOrEmpty, isNullOrEmpty);
String.stringify = Object.getValueOrDefault(String.stringify, stringify);
String.format = Object.getValueOrDefault(String.format, format);
