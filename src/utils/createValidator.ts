import { CheckResult, RuleType } from '../types';
import formatErrorMessage from './formatErrorMessage';
function isObj(o: unknown): o is Record<PropertyKey, unknown> {
  return o != null && (typeof o === 'object' || typeof o == 'function');
}
function isPromiseLike(v: unknown): v is Promise<unknown> {
  return v instanceof Promise || (isObj(v) && typeof v.then === 'function');
}
/**
 * Create a data validator
 * @param data
 */
export function createValidator<V, D, E>(data?: D, name?: string | string[]) {
  return (value: V, rules: RuleType<V, D, E>[]): CheckResult<E> | null => {
    for (let i = 0; i < rules.length; i += 1) {
      const { onValid, errorMessage, params } = rules[i];
      const checkResult = onValid(value, data, name);

      if (checkResult === false) {
        return {
          hasError: true,
          errorMessage: formatErrorMessage<E>(errorMessage, {
            ...params,
            name: Array.isArray(name) ? name.join('.') : name
          })
        };
      } else if (isPromiseLike(checkResult)) {
        throw new Error(
          'synchronous validator had an async result, you should probably call "checkAsync()"'
        );
      } else if (typeof checkResult === 'object' && (checkResult.hasError || checkResult.array)) {
        return checkResult;
      }
    }

    return null;
  };
}

export default createValidator;
