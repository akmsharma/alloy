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

import createPrivacyComponent from "../../../../../src/components/Privacy/index";
import { objectOf } from "../../../../../src/utils/validation";

describe("Privacy::index", () => {
  [{}, { consentEnabled: true }, { consentEnabled: false }].forEach(cfg => {
    it(`validates configuration (${JSON.stringify(cfg)})`, () => {
      objectOf(createPrivacyComponent.configValidators)(cfg);
    });
  });

  [{ consentEnabled: "foo" }].forEach(cfg => {
    it(`invalidates configuration (${JSON.stringify(cfg)})`, () => {
      expect(() => {
        objectOf(createPrivacyComponent.configValidators)(cfg);
      }).toThrowError();
    });
  });
});
