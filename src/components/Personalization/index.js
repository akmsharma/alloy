/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { isNonEmptyArray, groupBy, values, assign } from "../../utils";
import { string, boolean, arrayOf, objectOf } from "../../utils/validation";
import { initDomActionsModules, executeActions } from "./turbine";
import { hideContainers, showContainers } from "./flicker";
import collectClicks from "./helper/clicks/collectClicks";
import * as SCHEMAS from "../../constants/schemas";

const DECISIONS_HANDLE = "personalization:decisions";
const PAGE_WIDE_SCOPE = "page_wide_scope";
const GET_DECISIONS_OPTIONS_SCHEMA = {
  viewStart: boolean().default(false),
  scopes: arrayOf(string()).default([])
};
const allSchemas = values(SCHEMAS);
// This is used for Target VEC integration
const isAuthoringMode = () => document.location.href.indexOf("mboxEdit") !== -1;
const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
};

const storeDecisions = (storage, decisions) => {
  if (!decisions) {
    return;
  }

  const filteredDecisions = groupBy(
    decisions,
    decision => decision.scope || PAGE_WIDE_SCOPE
  );

  Object.keys(filteredDecisions).forEach(scope => {
    storage[scope] = filteredDecisions[scope];
  });
};

const filterDecisions = (storage, scopes) => {
  const decisions = [];

  scopes.forEach(scope => {
    if (storage[scope]) {
      decisions.push(...storage[scope]);
    }
  });

  return decisions;
};

const buildActions = (decision, items) => {
  const meta = { decisionId: decision.id };

  return items.map(item => assign({}, item.data, { meta }));
};

const executeDecisions = (decisions, modules, logger) => {
  decisions.forEach(decision => {
    const group = groupBy(decision.items, item => item.schema);
    const items = group[SCHEMAS.DOM_ACTION];

    if (isNonEmptyArray(items)) {
      const actions = buildActions(decision, items);

      executeActions(actions, modules, logger);
    }
  });
};

const createCollect = eventManager => {
  return meta => {
    const event = eventManager.createEvent();

    mergeMeta(event, meta);

    eventManager.sendEvent(event);
  };
};

const validateOptions = options => {
  const validate = objectOf(GET_DECISIONS_OPTIONS_SCHEMA);
  const result = validate(options);
  const { viewStart, scopes } = result;

  if (!viewStart && scopes.length === 0) {
    throw new Error(
      "Invalid getDecisions command options parameter: " +
        "'viewStart' must be set to true or scopes must be defined."
    );
  }

  return result;
};

const createPersonalization = ({ config, logger, eventManager }) => {
  const { prehidingStyle } = config;
  const authoringModeEnabled = isAuthoringMode();
  const collect = createCollect(eventManager);
  const storage = [];
  const decisionsStorage = {};
  const store = value => storage.push(value);
  const modules = initDomActionsModules(collect, store);

  return {
    lifecycle: {
      onBeforeEvent({ event, isViewStart, scopes = [] }) {
        if (authoringModeEnabled) {
          logger.warn("Rendering is disabled, authoring mode.");

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return;
        }
        const hasScopes = scopes.length > 0;
        const queryDetails = {};

        // For viewStart we try to hide the personalization containers
        if (isViewStart) {
          hideContainers(prehidingStyle);
        }

        if (isViewStart || hasScopes) {
          event.expectResponse();
          queryDetails.accepts = allSchemas;
        }

        if (hasScopes) {
          queryDetails.scopes = scopes;
        }

        mergeQuery(event, queryDetails);
      },
      onResponse({ response }) {
        if (authoringModeEnabled) {
          return;
        }

        const decisions = response.getPayloadsByType(DECISIONS_HANDLE);

        executeDecisions(decisions, modules, logger);

        showContainers();

        storeDecisions(decisionsStorage, decisions);
      },
      onRequestFailure() {
        showContainers();
      },
      onClick({ event, clickedElement }) {
        const merger = meta => mergeMeta(event, meta);

        collectClicks(merger, clickedElement, storage);
      }
    },

    commands: {
      getDecisions(options = {}) {
        const { viewStart, scopes } = validateOptions(options);
        // Cloning scopes to avoid changing input options
        const localScopes = [...scopes];

        if (viewStart) {
          localScopes.push(PAGE_WIDE_SCOPE);
        }

        return filterDecisions(decisionsStorage, localScopes);
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
