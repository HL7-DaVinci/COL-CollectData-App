var COL;
if (!COL) {
    COL = {};
}

(function () {

  COL.scenarioDescription = {
      "description" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit,\n" +
          "            sed do eiusmod tempor incididunt ut labore et dolore magna\n" +
          "            aliqua. Ut enim ad minim veniam, quis nostrud exercitation\n" +
          "            ullamco laboris nisi ut aliquip ex ea commodo consequat.\n" +
          "            Duis aute irure dolor in reprehenderit in voluptate velit\n" +
          "            esse cillum dolore eu fugiat nulla pariatur. Excepteur sint\n" +
          "            occaecat cupidatat non proident, sunt in culpa qui officia\n" +
          "            deserunt mollit anim id est laborum."
  };
  COL.clientSettings = {
    "client_id": "8b7ac7ca-9aea-4e8c-8523-2b6338b2b1ff",
    "scope"    : "user/*.* openid profile"
  };

  COL.submitEndpoint = "";

  COL.providerEndpoints = [{
        "name": "DaVinci COL Provider (Open)",
        "type": "open",
        "url": "https://api-v8-stu3.hspconsortium.org/DaVinciCOLPayer/open"
    },
    {
        "name": "DaVinci COL Provider (Secure)",
        "type": "open",
        "url": "https://api-v8-stu3.hspconsortium.org/DaVinciCOLPayer/open",
        "clientID": "4a71a430-0316-4e2a-8477-7671d7d3b862",
        "scope": "user/*.read"
    }
  ];

  // default configuration
  COL.configSetting = 0; // HSPC Payer Demo (Open)
  COL.providerEndpoint = COL.providerEndpoints[COL.configSetting];

  COL.reportPeriod = 12;

}());
