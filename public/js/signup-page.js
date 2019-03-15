window.localStorage.clear();
function showAlerts(msg, flag) {
    if (flag == undefined) {
        $('#warning').empty();
        $('#warning').show();
        $('#success').hide();
        $('#warning').html(msg);
        return;
    }

    if (flag == "true") {
        $('#danger').empty();
        $('#danger').show();
        $('#success').hide();
        $('#danger').html(msg);
        return;
    } else {
        $('#success').empty();
        $('#success').show();
        $('#success').html(msg);
        return;
    }
}

$('#password, #confirm-password').on('keyup', function () {
    if ($('#password').val() == $('#confirm-password').val()) {
        $('#message').html('Matching').css('color', 'green');
    } else
        $('#message').html('Not Matching').css('color', 'red');
});

function validateForm() {
    if ($('#password').val() == $('#confirm-password').val()) {
        if (!($('#professional').is(':checked') || $('#consumer').is(':checked'))) {
            showAlerts('Select Either Licensed Financial Professional or Consumer');
            return false;
        }
    } else {
        showAlerts("Passwords Don't Match");
        return false
    }
}