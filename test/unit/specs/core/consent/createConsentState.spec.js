/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createConsentState from "../../../../../src/core/consent/createConsentState";
import { cookieJar } from "../../../../../src/utils";

describe("createConsentState", () => {
  const consentCookieName = "kndctr_ABC_Adobe_consent";
  let config;

  beforeEach(() => {
    cookieJar.remove(consentCookieName);
    config = {
      orgId: "ABC@Adobe"
    };
  });

  describe("isPending", () => {
    it("returns true if consent cookie is not set", () => {
      const consentState = createConsentState({ config });
      expect(consentState.isPending()).toBeTrue();
    });

    it("returns false if consent cookie has all purposes set to true", () => {
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      const consentState = createConsentState({ config });
      expect(consentState.isPending()).toBeFalse();
    });

    it("returns false if the consent cookie has all purposes set to false", () => {
      cookieJar.set(consentCookieName, "tracking=out;personalization=out");
      const consentState = createConsentState({ config });
      expect(consentState.isPending()).toBeFalse();
    });

    it("returns true if suspended", () => {
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      const consentState = createConsentState({ config });
      consentState.suspend();
      expect(consentState.isPending()).toBeTrue();
    });

    it("reflects updated cookie after unsuspend is called", () => {
      const consentState = createConsentState({ config });
      consentState.suspend();
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      consentState.unsuspend();
      expect(consentState.isPending()).toBeFalse();
    });

    it("reflects updated cookie after updateFromCookies is called if unsuspended", () => {
      const consentState = createConsentState({ config });
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      consentState.updateFromCookies();
      expect(consentState.isPending()).toBeFalse();
    });

    it("does not reflect updated cookie after updateFromCookies is called if suspended", () => {
      const consentState = createConsentState({ config });
      consentState.suspend();
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      consentState.updateFromCookies();
      expect(consentState.isPending()).toBeTrue();
    });
  });

  describe("hasConsentedToAllPurposes", () => {
    it("returns false if consent cookie is not set", () => {
      const consentState = createConsentState({ config });
      expect(consentState.hasConsentedToAllPurposes()).toBeFalse();
    });

    it('returns true if consent cookie has all purposes set to "in"', () => {
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      const consentState = createConsentState({ config });
      expect(consentState.hasConsentedToAllPurposes()).toBeTrue();
    });

    it('returns false if consent cookie has any purposes set to "out"', () => {
      cookieJar.set(consentCookieName, "tracking=in;personalization=out");
      const consentState = createConsentState({ config });
      expect(consentState.hasConsentedToAllPurposes()).toBeFalse();
    });

    it("returns false if suspended", () => {
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      const consentState = createConsentState({ config });
      consentState.suspend();
      expect(consentState.hasConsentedToAllPurposes()).toBeFalse();
    });

    it("reflects updated cookie after unsuspend is called", () => {
      const consentState = createConsentState({ config });
      consentState.suspend();
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      consentState.unsuspend();
      expect(consentState.hasConsentedToAllPurposes()).toBeTrue();
    });

    it("reflects updated cookie after updateFromCookies is called if unsuspended", () => {
      const consentState = createConsentState({ config });
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      consentState.updateFromCookies();
      expect(consentState.hasConsentedToAllPurposes()).toBeTrue();
    });

    it("does not reflect updated cookie after updateFromCookies is called if suspended", () => {
      const consentState = createConsentState({ config });
      consentState.suspend();
      cookieJar.set(consentCookieName, "tracking=in;personalization=in");
      consentState.updateFromCookies();
      expect(consentState.hasConsentedToAllPurposes()).toBeFalse();
    });
  });

  describe("onChange", () => {
    it("is called when suspend or unsuspend is called", () => {
      const consentState = createConsentState({ config });
      const onChange = jasmine.createSpy("onChange");
      consentState.onChange(onChange);
      expect(onChange).not.toHaveBeenCalled();
      consentState.suspend();
      expect(onChange).toHaveBeenCalledTimes(1);
      consentState.unsuspend();
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("is called when updateFromCookies is called", () => {
      const consentState = createConsentState({ config });
      const onChange = jasmine.createSpy("onChange");
      consentState.onChange(onChange);
      expect(onChange).not.toHaveBeenCalled();
      consentState.updateFromCookies();
      expect(onChange).toHaveBeenCalled();
    });
  });
});
