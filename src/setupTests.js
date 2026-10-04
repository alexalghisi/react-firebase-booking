// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { TextDecoder, TextEncoder } from 'util';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
import '@testing-library/jest-dom';

const originalConsoleError = console.error.bind(console);
console.error = (...args) => {
    const message = args.map((item) => String(item)).join(' ');
    if (message.includes('ReactDOMTestUtils.act') || message.includes('not wrapped in act')) {
        return;
    }
    originalConsoleError(...args);
};

const originalConsoleWarn = console.warn.bind(console);
console.warn = (...args) => {
    const message = args.map((item) => String(item)).join(' ');
    if (message.includes('React Router Future Flag Warning')) {
        return;
    }
    originalConsoleWarn(...args);
};

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

if (typeof global.ReadableStream === 'undefined') {
    global.ReadableStream = ReadableStream;
}

if (typeof global.TransformStream === 'undefined') {
    global.TransformStream = TransformStream;
}

if (typeof global.WritableStream === 'undefined') {
    global.WritableStream = WritableStream;
}
