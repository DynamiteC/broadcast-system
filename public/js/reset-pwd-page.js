function validateForm() {
    if ($('#password').val() == $('#confirm-password').val()) {
        return true
    } else {
        return false
    }
}

$('#password, #confirm-password').on('keyup', function () {
    if ($('#password').val() == $('#confirm-password').val()) {
        $('#message').html('Matching').css('color', 'green');
    } else
        $('#message').html('Not Matching').css('color', 'red');
});