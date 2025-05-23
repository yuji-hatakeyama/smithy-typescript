import { chain, memoize } from "@smithy/property-provider";
import { Provider } from "@smithy/types";

import { EnvOptions, fromEnv, GetterFromEnv } from "./fromEnv";
import { fromSharedConfigFiles, GetterFromConfig, SharedConfigInit } from "./fromSharedConfigFiles";
import { fromStatic, FromStaticConfig } from "./fromStatic";

/**
 * @internal
 */
export type LocalConfigOptions = SharedConfigInit & EnvOptions;

/**
 * @internal
 */
export interface LoadedConfigSelectors<T> {
  /**
   * A getter function getting the config values from all the environment
   * variables.
   */
  environmentVariableSelector: GetterFromEnv<T>;
  /**
   * A getter function getting config values associated with the inferred
   * profile from shared INI files
   */
  configFileSelector: GetterFromConfig<T>;
  /**
   * Default value or getter
   */
  default: FromStaticConfig<T>;
}

/**
 * @internal
 */
export const loadConfig = <T = string>(
  { environmentVariableSelector, configFileSelector, default: defaultValue }: LoadedConfigSelectors<T>,
  configuration: LocalConfigOptions = {}
): Provider<T> => {
  const { signingName, logger } = configuration;
  const envOptions: EnvOptions = { signingName, logger };

  return memoize(
    chain(
      fromEnv(environmentVariableSelector, envOptions),
      fromSharedConfigFiles(configFileSelector, configuration),
      fromStatic(defaultValue)
    )
  );
};
