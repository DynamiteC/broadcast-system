// $(function () {
//     var socket = io();
// });

// $(document).ready(function () {

//     $('#nickname').change(function () {
//         if ($(this).val() != '') {
//             console.log($(this).val());
//         }
//     });

//     $('#nickname').on('keyup', function (e) {
//         if (e.keyCode == 13) {
//             if ($('#nickname').val() != '')
//                 $('#nickname').change();
//         }
//     });
// })
$(document).ready(function () {
    var socket = io();
    $.get('/get_chatters', function (response) {
        $('.chat-info').text("There are currently " + response.length + " people in the chat room");
        chatter_count = response.length; //update chatter count
    });

    $.get('/get_messages', function (response) {
        if (window.location.href.indexOf('/chat') > -1) {
            if (response.length > 0) {
                var message_count = response.length;
                var html = '';
                for (var x = 0; x < message_count; x++) {
                    console.log($('#username').html());
                    if (response[x]['sender'] == $.trim($('#username').html())) {
                        html +=
                            '<div class="card grey darken-2 white-text right-align"><div class="card-title">' +
                            response[x]['sender'] + '</div><div class="card-body">' + response[x]['message'] +
                            '</div></div>';
                    } else {
                        html +=
                            '<div class="card grey lighten-2 black-text left-align"><div class="card-title">' +
                            response[x]['sender'] + '</div><div class="card-body">' + response[x]['message'] +
                            '</div></div>';
                    }
                }
                $('#broadcast_msgs').html(html);
            }
        }
    });

    $('#join-chat').click(function () {
        var username = $.trim($('#username').val());
        var password = $.trim($('#password').val());
        if (username == '' || password == '')
            return;
        $.ajax({
            url: '/join',
            type: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function (response) {
                if (response.status == 'OK') { //username doesn't already exists
                    socket.emit('update_chatter_count', {
                        'action': 'increase',
                        'username': username
                    });
                    socket.emit('login', {
                        username: username,
                        password: password
                    });
                    setTimeout(function () {
                        window.location.href = '/chat'
                    }, 500);
                } else if (response.status == 'FAILED') { //username already exists
                    alert("Sorry but the username or password combination is incorrect, if you're new try new username");
                    $('#username').val('').focus();
                }
            }
        });
    });

    $('#sign-out').click(function () {
        var username = $('#username').html();
        $.ajax({
            url: '/leave',
            type: 'POST',
            dataType: 'json',
            data: {
                username: username
            },
            success: function (response) {
                if (response.status == 'OK') {
                    socket.emit('message', {
                        'username': username,
                        'message': username + " has left the chat room.."
                    });
                    socket.emit('update_chatter_count', {
                        'action': 'decrease',
                        'username': username
                    });
                    setTimeout(function () {
                        window.location.href = '/logout'
                    }, 500)
                    alert('You have successfully left the chat room');
                }
            }
        });
    });

    $('#send_brdcst_msg').click(function () {
        var username = $(this).data('username');
        var message = $.trim($('#brd_message').val());
        $.ajax({
            url: '/send_brdcst_msg',
            type: 'POST',
            dataType: 'json',
            data: {
                'username': username,
                'message': message
            },
            success: function (response) {
                if (response.status == 'OK') {
                    socket.emit('message', {
                        'username': username,
                        'message': message
                    });
                    $('#brd_message').val('');
                }
            }
        });
    });

    socket.on('send', function (data) {
        var username = data.username;
        var message = data.message;
        if (username == $.trim($('#username').html())) {
            var html = '<div class="card grey darken-2 white-text right-align"><div class="card-title">' +
                username + '</div><div class="card-body">' + message +
                '</div></div>';
        } else {
            var html = '<div class="card grey lighten-2 black-text left-align"><div class="card-title">' +
                response[x]['sender'] + '</div><div class="card-body">' + response[x]['message'] +
                '</div></div>';
        }

        $('#broadcast_msgs').append(html);
    });
    socket.on('count_chatters', function (data) {
        if (data.action == 'increase') {
            chatter_count++;
        } else {
            chatter_count--;
        }
        $('.chat-info').text("There are currently " + chatter_count + " people in the chat room");
    });
});