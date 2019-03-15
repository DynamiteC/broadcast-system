$(function () {
    var socket = io();
});

$(document).ready(function () {

    $('#nickname').change(function () {
        if ($(this).val() != '') {
            console.log($(this).val());
        }
    });

    $('#nickname').on('keyup', function (e) {
        if (e.keyCode == 13) {
            if ($('#nickname').val() != '')
                $('#nickname').change();
        }
    });
})