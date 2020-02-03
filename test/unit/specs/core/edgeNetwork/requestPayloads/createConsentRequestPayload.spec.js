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

import createConsentRequestPayload from "../../../../../../src/core/edgeNetwork/requestPayloads/createConsentRequestPayload";

describe("createConsentRequestPayload", () => {
  it("should not use ID third-party domain when useIdThirdPartyDomain is not called", () => {
    const payload = createConsentRequestPayload();
    expect(payload.getUseIdThirdPartyDomain()).toBeFalse();
  });

  it("should use ID third-party domain when useIdThirdPartyDomain is called", () => {
    const payload = createConsentRequestPayload();
    payload.useIdThirdPartyDomain();
    expect(payload.getUseIdThirdPartyDomain()).toBeTrue();
  });

  it("should have a expectResponse method", () => {
    // It doesn't do anything in this case, but Identity currently
    // calls expectResponse because it doesn't know what type of payload
    // object it is (data collection vs. consent).
    const payload = createConsentRequestPayload();
    expect(payload.expectResponse).toEqual(jasmine.any(Function));
  });

  it("serializes properly", () => {
    const payload = createConsentRequestPayload();
    payload.mergeConfigOverrides({
      testOverride: "testOverrideValue"
    });
    payload.mergeState({
      testState: "testStateValue"
    });
    payload.useIdThirdPartyDomain();
    payload.addIdentity("IDNS", {
      id: "ABC123"
    });
    payload.setConsentLevel({
      purpose1: "in",
      purpose2: "out"
    });
    expect(payload.toJSON()).toEqual({
      meta: {
        configOverrides: {
          testOverride: "testOverrideValue"
        },
        state: {
          testState: "testStateValue"
        }
      },
      identityMap: {
        IDNS: [
          {
            id: "ABC123"
          }
        ]
      },
      consentLevel: {
        purpose1: "in",
        purpose2: "out"
      }
    });
  });
});
