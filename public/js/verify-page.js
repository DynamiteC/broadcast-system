$('#rsndC').click(function () {
    $.post('/resendCode', {
        'confirm_code': $('#confirm_code').html(),
        'email': $('#mailId').html()
    });
    return alert('Mail Sent.');
});