var COL;
if (!COL) {
    COL = {};
}

(function () {

  COL.clientSettings = {
    "client_id": "8b7ac7ca-9aea-4e8c-8523-2b6338b2b1ff",
    "scope"    : "user/*.* openid profile"
  };

  COL.submitEndpoint = "";

  COL.providerEndpoints = [{
      "name": "DaVinci COL Provider (Open)",
      "type": "open",
      "url": "https://api-v8-stu3.hspconsortium.org/DaVinciCOLPayer/open"
    }
  ];

  // default configuration
  COL.configSetting = 0; // HSPC Payer Demo (Open)
  COL.providerEndpoint = COL.providerEndpoints[COL.configSetting];

}());
