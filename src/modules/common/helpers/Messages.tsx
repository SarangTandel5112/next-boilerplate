import type * as React from 'react';
import messages from '@/locales/en.json';

type Messages = typeof messages;
type MessageNamespace = keyof Messages;
type MessageKey<N extends MessageNamespace> = keyof Messages[N];

const isPrimitive = (value: unknown): value is string | number => {
  return typeof value === 'string' || typeof value === 'number';
};

const formatMessage = (
  template: string,
  values?: Record<string, React.ReactNode | string | number>,
) => {
  if (!values) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return isPrimitive(value) ? String(value) : match;
  });
};

export const getMessage = <N extends MessageNamespace, K extends MessageKey<N>>(
  namespace: N,
  key: K,
  values?: Record<string, React.ReactNode | string | number>,
) => {
  const template = messages[namespace][key];
  return formatMessage(String(template), values);
};

export const renderMessage = (
  message: string,
  values?: Record<string, React.ReactNode | string | number>,
) => {
  const richPattern = /<(\w+)><\/\1>/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of message.matchAll(richPattern)) {
    const index = match.index ?? 0;
    const before = message.slice(lastIndex, index);
    const key = match[1] as string;
    const replacement = key ? values?.[key] : undefined;

    if (before) {
      parts.push(formatMessage(before, values));
    }

    if (replacement !== undefined) {
      parts.push(replacement);
    }

    lastIndex = index + match[0].length;
  }

  const tail = message.slice(lastIndex);
  if (tail) {
    parts.push(formatMessage(tail, values));
  }

  if (parts.length === 0) {
    return formatMessage(message, values);
  }

  return <>{parts}</>;
};

export const messagesCatalog = messages;
