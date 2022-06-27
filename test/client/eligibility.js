/* @flow */

import { values } from "@krakenjs/belter/src";
import { FUNDING } from "@paypal/sdk-constants/src";

describe(`eligibility cases`, () => {
  it("should get funding sources", () => {
    const fundingSources = window.paypal.getFundingSources();

    if (!Array.isArray(fundingSources)) {
      throw new TypeError(`Expected getFundingSources to return an array`);
    }

    const validSources = values(FUNDING);

    for (const fundingSource of fundingSources) {
      if (validSources.indexOf(fundingSource) === -1) {
        throw new Error(`Invalid funding source: ${fundingSource}`);
      }
    }
  });

  it("should get funding source eligibility for valid sources", () => {
    const validSources = values(FUNDING);

    for (const fundingSource of validSources) {
      if (typeof window.paypal.isFundingEligible(fundingSource) !== "boolean") {
        throw new TypeError(`Expected valid result for ${fundingSource}`);
      }
    }
  });

  it("should throw an error for an invalid funding source", () => {
    let error;

    try {
      window.paypal.isFundingEligible("blerg");
    } catch (err) {
      error = err;
    }

    if (!error) {
      throw new Error(`Expected error to be thrown`);
    }
  });
});
