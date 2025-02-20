import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { GitlabDiscoveryEntityProvider } from '@backstage/plugin-catalog-backend-module-gitlab';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { loggerToWinstonLogger } from '@backstage/backend-common';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: createBackendModule({
    moduleId: 'catalog-backend-module-gitlab',
    pluginId: 'catalog',
    register(env) {
      env.registerInit({
        deps: {
          catalog: catalogProcessingExtensionPoint,
          config: coreServices.rootConfig,
          logger: coreServices.logger,
          scheduler: coreServices.scheduler,
        },
        async init({ catalog, config, logger, scheduler }) {
          catalog.addEntityProvider(
            ...GitlabDiscoveryEntityProvider.fromConfig(config, {
              logger: loggerToWinstonLogger(logger),
              schedule: scheduler.createScheduledTaskRunner({
                frequency: { minutes: 30 },
                timeout: { minutes: 3 },
              }),
              scheduler: scheduler,
            }),
          );
        },
      });
    },
  }),
};
