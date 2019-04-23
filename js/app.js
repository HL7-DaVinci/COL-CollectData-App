var COL;
if (!COL) {
    COL = {};
}

(function () {

    COL.client = null;
    COL.patients = [];

    COL.now = () => {
        let date = new Date();
        return date.toISOString();
    };

    COL.displayScreen = (screenID) => {
        $('#selection-screen').hide();
        $('#review-screen').hide();
        $('#confirm-screen').hide();
        $('#config-screen').hide();
        $('#'+screenID).show();
    };

    COL.displaySelectionScreen = () => {
        COL.displayScreen('selection-screen');
    };

    COL.displayReviewScreen = () => {
        $("#final-list").empty();
        let checkboxes = $('#selection-list input[type=checkbox]');
        let selectedPatients = [];
        for (let i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checked == true){
                selectedPatients.push(checkboxes[i].id);
            }
        }
        COL.patients.forEach((patient) => {
            if(selectedPatients.includes(patient.id)) {
                $('#final-list').append(
                    "<tr> <td class='medtd'>" + COL.getPatientName(patient) + "</td></tr>");
            }
        });

        COL.displayScreen('review-screen');
    };

    COL.displayConfigScreen = () => {
        if (COL.configSetting === "custom") {
            $('#config-select').val("custom");
        } else {
            $('#config-select').val(COL.configSetting);
        }
        $('#config-text').val(JSON.stringify(COL.providerEndpoint, null, 2));
        COL.displayScreen('config-screen');
    };

    COL.displayConfirmScreen = () => {
        COL.displayScreen('confirm-screen');
    };

    COL.displayErrorScreen = (title, message) => {
        $('#error-title').html(title);
        $('#error-message').html(message);
        COL.displayScreen('error-screen');
    };

    COL.getPatientName = (pt) => {
        if (pt.name) {
            let names = pt.name.map((n) => n.given.join(" ") + " " + n.family);
            return names.join(" / ");
        } else {
            return "anonymous";
        }
    };

    COL.disable = (id) => {
        $("#"+id).prop("disabled",true);
    };

    COL.loadData = (client) => {
        COL.displaySelectionScreen();
        try {
            COL.client = client;
            COL.client.api.fetchAll(
                {type: "Patient"}
            ).then(function (results) {
                COL.patients = results;
                results.forEach((patient) => {
                    $('#selection-list').append("<tr><td>" + COL.getPatientName(patient) +
                        "</td><td><input type='checkbox' id=" + patient.id + "></td></tr>");
                });
            });
        } catch (err) {
            COL.displayErrorScreen("Failed to initialize request menu", "Please make sure that everything is OK with request configuration");
        }
    };

    COL.initialize = (client) => {
        COL.loadConfig();
        if (sessionStorage.operationPayload) {
            if (JSON.parse(sessionStorage.tokenResponse).refresh_token) {
                // save state in localStorage
                let state = JSON.parse(sessionStorage.tokenResponse).state;
                localStorage.tokenResponse = sessionStorage.tokenResponse;
                localStorage[state] = sessionStorage[state];
            }
            COL.operationPayload = JSON.parse(sessionStorage.operationPayload);
            COL.providerEndpoint.accessToken = JSON.parse(sessionStorage.tokenResponse).access_token;
            COL.finalize();
        } else {
            COL.loadData(client);
        }
    };

    COL.loadConfig = () => {
        let configText = window.localStorage.getItem("cdex-app-config");
        if (configText) {
            let conf = JSON.parse (configText);
            if (conf['custom']) {
                COL.providerEndpoint = conf['custom'];
                COL.configSetting = "custom";
            } else {
                COL.providerEndpoint = COL.providerEndpoints[conf['selection']];
                COL.configSetting = conf['selection'];
            }
        }
    }

    COL.reconcile = () => {
        $('#discharge-selection').hide();
        COL.disable('btn-submit');
        COL.disable('btn-edit');
        $('#btn-submit').html("<i class='fa fa-circle-o-notch fa-spin'></i> Submit measure report");

        if (COL.providerEndpoint.type === "secure-smart") {
            sessionStorage.operationPayload = JSON.stringify(COL.operationPayload);
            if (localStorage.tokenResponse) {
                // load state from localStorage
                let state = JSON.parse(localStorage.tokenResponse).state;
                sessionStorage.tokenResponse = localStorage.tokenResponse;
                sessionStorage[state] = localStorage[state];
                FHIR.oauth2.ready(COL.initialize);
            } else {
                FHIR.oauth2.authorize({
                    "client": {
                        "client_id": COL.providerEndpoint.clientID,
                        "scope":  COL.providerEndpoint.scope
                    },
                    "server": COL.providerEndpoint.url
                });
            }
        } else {
            COL.finalize();
        }
    };

    COL.finalize = () => {
        let promise;

        var config = {
            type: 'POST',
            url: COL.providerEndpoint.url + COL.submitEndpoint,
            data: JSON.stringify(COL.operationPayload),
            contentType: "application/fhir+json"
        };

        if (COL.providerEndpoint.type !== "open") {
            config['beforeSend'] = function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer " + COL.providerEndpoint.accessToken);
            };
        }

        promise = $.ajax(config);

        promise.then(() => {
            console.log (JSON.stringify(COL.operationPayload, null, 2));
            COL.displayConfirmScreen();
        }, () => COL.displayErrorScreen("Communication request submission failed", "Please check the submit endpoint configuration"));
    }


    $('#btn-review').click(COL.displayReviewScreen);
    $('#btn-edit').click(COL.displaySelectionScreen);
    $('#btn-submit').click(COL.reconcile);
    $('#btn-configuration').click(COL.displayConfigScreen);
    $('#btn-config').click(function () {
        let selection = $('#config-select').val();
        if (selection !== 'custom') {
            window.localStorage.setItem("cdex-app-config", JSON.stringify({'selection': parseInt(selection)}));
        } else {
            let configtext = $('#config-text').val();
            let myconf;
            try {
                myconf = JSON.parse(configtext);
                window.localStorage.setItem("cdex-app-config", JSON.stringify({'custom': myconf}));
            } catch (err) {
                alert ("Unable to parse configuration. Please try again.");
            }
        }
        COL.loadConfig();
        COL.displayReviewScreen();
    });

    COL.providerEndpoints.forEach((e, id) => {
        $('#config-select').append("<option value='" + id + "'>" + e.name + "</option>");
    });
    $('#config-select').append("<option value='custom'>Custom</option>");
    $('#config-text').val(JSON.stringify(COL.providerEndpoints[0],null,"   "));

    $('#config-select').on('change', function() {
        if (this.value !== "custom") {
            $('#config-text').val(JSON.stringify(COL.providerEndpoints[parseInt(this.value)],null,2));
        }
    });

    $('#config-text').bind('input propertychange', () => {
        $('#config-select').val('custom');
    });

    FHIR.oauth2.ready(COL.initialize);

}());
