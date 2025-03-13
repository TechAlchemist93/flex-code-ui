export const USE_CASES = [
  {
    name: "AdminCreateUseCase",
    workflows: [
      {
        name: "verifyEmailIsUnique",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "createUser",
        source: "CODE",
        params: [],
        enabled: true,
      },
    ],
  },
  {
    name: "CustomerCreateUseCase",
    workflows: [
      {
        name: "verifyEmailIsUnique",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "createUser",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "createUserRewards",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "setValue",
        source: "API",
        params: ["referrerRewardOverride", 75],
        enabled: true,
      },
      {
        name: "grantReferrerReward",
        source: "API",
        params: [],
        enabled: false,
      },
    ],
  },
  {
    name: "SignInUseCase",
    workflows: [
      {
        name: "verifyCredentials",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "getUserById",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "generateAuthToken",
        source: "CODE",
        params: [],
        enabled: true,
      },
    ],
  },
  {
    name: "SignUpUseCase",
    workflows: [
      {
        name: "createCustomer",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "upsertCredentials",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "generateAuthToken",
        source: "CODE",
        params: [],
        enabled: true,
      },
    ],
  },
  {
    name: "UserReferralRetrieveUseCase",
    workflows: [
      {
        name: "getReferralData",
        source: "CODE",
        params: [],
        enabled: true,
      },
    ],
  },
  {
    name: "AvailabilityUseCase",
    workflows: [
      {
        name: "getAvailability",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "setValue",
        source: "API",
        params: ["availability.tomorrow().*", true],
        enabled: false,
      },
      {
        name: "ifContainsService1",
        source: "API",
        params: [
          {
            name: "setValue",
            source: "CODE",
            params: ["availability.tomorrow().*", true],
            enabled: true,
          },
        ],
        enabled: false,
      },
      {
        name: "ifOnlyContainsService1",
        source: "API",
        params: [
          {
            name: "setValue",
            source: "CODE",
            params: ["availability.tomorrow().*", true],
            enabled: true,
          },
        ],
        enabled: true,
      },
    ],
  },
  {
    name: "AppointmentCreateUseCase",
    workflows: [
      {
        name: "getAvailability",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "verifySlotIsAvailable",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "createAppointment",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "ifUsersFirstAppointment",
        source: "API",
        params: [
          {
            name: "getUserById",
            source: "CODE",
            params: [],
            enabled: true,
          },
          {
            name: "grantReferrerReward",
            source: "CODE",
            params: [],
            enabled: true,
          },
        ],
        enabled: false,
      },
    ],
  },
  {
    name: "AppointmentCompleteUseCase",
    workflows: [
      {
        name: "completeAppointment",
        source: "CODE",
        params: [],
        enabled: true,
      },
      {
        name: "ifUsersFirstAppointment",
        source: "API",
        params: [
          {
            name: "getUserById",
            source: "CODE",
            params: [],
            enabled: true,
          },
          {
            name: "grantReferrerReward",
            source: "CODE",
            params: [],
            enabled: true,
          },
        ],
        enabled: true,
      },
    ],
  },
];
