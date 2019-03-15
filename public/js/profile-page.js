(function () {
    (function () {
        if ($('#pfname')[0] != undefined) {
            let ptemp = $('#pfname').html();
            $('#pfname').html(ptemp.trim());
            var txtA = $('textarea');
            for (let x = 0; x < txtA.length; x++) {
                var temp = $(txtA[x]).html();
                $(txtA[x]).html(temp.trim());
            }
        }
    })();

    $('td').click(function (e) {
        if (e.target.firstChild.nodeName == 'SPAN') {
            window.location.href = '/home/profile/calculators/?name=' + e.target.innerText.trim();
            return;
        }
    });

    $('span').click(function (e) {
        if (e.target.nodeName == 'SPAN' && e.target.parentNode.nodeName == 'TD') {
            window.location.href = '/home/profile/calculators/?name=' + e.target.innerHTML;
            return;
        }
    });

    $('a').click(function (e) {
        if (e.target.parentNode != '') {
            if (e.target.parentNode.parentNode != '') {
                let tr = e.target.parentNode.parentNode;
                if (tr.innerText != '') {
                    if (tr.innerText.indexOf('Remove') > -1) {
                        let name = tr.innerText.replace('Remove', '').trim();
                        if (name != 'Sample Client') {
                            $.post('/dl-calc', {
                                name: name,
                                _csrf: $('#csrf').val(),
                            });
                            $(this).parent().parent().html();
                            location.reload();
                        }
                    }
                }
            }
        }
    });

    $('#s-c-calc').click(function () {
        let calcName = $('#s-c-calc').html().trim();
        let pName = $('#pfname').html().trim();
        let regName = /^[A-Za-z\d\s]*$/;
        let inputsD = [],
            flagOk = true;
        if (pName != 'Sample Client') {
            $('input[type=text]').each(function () {
                if (flagOk) {
                    var name = $(this).parent()[0].innerText.replace('%', '').replace('$', '').trim();
                    if ($(this).val() == '') {
                        if (name == 'Lump Sum Premium' || name == 'Current Account Balance' || name == 'Employer Match (Annual & Contribution)') {
                            $(this).val(0);
                        } else {
                            flagOk = false;
                            var nameX = $(this).attr('name')
                            $('input[name=' + nameX + ']').focus();
                            return alert(name.replace('Monthly', '').replace('Annually', '').trim() + ' Should be Entered.');
                        }
                    }

                    if (name == 'Duration') {
                        if (isNaN(Number($(this).val()))) {
                            flagOk = false;
                            var nameX = $(this).attr('name')
                            $('input[name=' + nameX + ']').focus();
                            return alert('Enter Only Number in Duration');
                        }

                        if ((!isNaN(Number($(this).val()))) && ($(this).val() < 1 || $(this).val() > 40)) {
                            flagOk = false;
                            var nameX = $(this).attr('name')
                            $('input[name=' + nameX + ']').focus();
                            return alert('Enter Value of Years Between 1 to 40');
                        }
                    }

                    if (name == 'Name') {
                        if (!regName.test($(this).val())) {
                            flagOk = false;
                            var nameX = $(this).attr('name')
                            $('input[name=' + nameX + ']').focus();
                            return alert("Name should Only Contain AlphaNumeric text");
                        }
                    }
                    inputsD.push($(this).attr('name') + '::' + $(this).val());
                }
            });
            inputsD.push('annOrMon::' + (($('input[name=optn-m-a]')[0].checked) ? false : true));
            let ifd = $('textarea[name=iulFeeDetail]')[0].value;
            let iav = $('textarea[name=iulAcctValDetail]')[0].value;
            if (flagOk) {
                if (calcName.toLowerCase().indexOf('save') > -1) {
                    $('#s-c-calc').html('<i class="fa fa-circle-o-notch fa-spin" style="font-size:inherit;"></i>&nbsp;Save Calculators');
                    $.post('/up-calc', {
                        old: pName,
                        inp: inputsD.join(';;'),
                        ifd: ifd.toString(),
                        iav: iav.toString(),
                        _csrf: $('#csrf').val(),
                    });

                } else {
                    $('#s-c-calc').html('<i class="fa fa-circle-o-notch fa-spin" style="font-size:inherit;"></i>&nbsp;Create Calculators');
                    $.post('/cr-calc', {
                        inp: inputsD.join(';;'),
                        ifd: ifd.toString(),
                        iav: iav.toString(),
                        _csrf: $('#csrf').val(),
                    });
                }
                window.location.href = "/home/profile/calculators/?name=" + inputsD[0].split('::')[1];
            }
        } else {
            window.location.href = "/home/profile/calculators/?name=" + pName;
        }
    });
    var asDollars = function (value) {
        return '$' + Number(value).toFixed(0);
    };

    var numberToCurrency = function (value) {
        var valueAsString = value.toString().replace(/,/g, '');
        var negative = valueAsString.indexOf("-") == 0;
        if (negative) {
            valueAsString = valueAsString.substr(1);
        }
        var length = valueAsString.length;
        for (var i = length - 3; i > 0; i -= 3) {
            valueAsString = valueAsString.substr(0, i) + "," + valueAsString.substr(i);
        }
        if (negative) {
            valueAsString = "-" + valueAsString;
        }
        return "$" + valueAsString;
    };

    var anyToNumber = function (value) {
        return Number(value.replace(/,/g, '').replace('$', '').replace('%', ''));
    };

    var encryptX = function (arr) {
        if (arr.length == 0)
            return '';
        for (let x = 0; x < arr.length; x++) {
            if (typeof arr[x] != 'string')
                arr[x] = arr[x].join('!');
        }
        return arr.join('#');
    };

    var decryptX = function (str) {
        if (str == '')
            return str;

        str = str.split(';');
        for (let x = 0; x < str.length; x++) {
            str[x] = str[x].split(':');
        }
        return str;
    }

    var encryptI = function (str) {
        if (str == '')
            return str;

        if (str.indexOf('\r\n') > -1) {
            let arr = str.split('\r\n');
            for (let x = 0; x < arr.length; x++) {
                arr[x] = arr[x].split(' ');
            }
            return encryptX(arr);
        } else {

            if (str.indexOf('\n') > -1) {
                let arr = str.split('\n');
                for (let x = 0; x < arr.length; x++) {
                    arr[x] = arr[x].split(' ');
                }
                return encryptX(arr);
            } else {
                if (str.indexOf('\r') > -1) {
                    let arr = str.split('\r');
                    for (let x = 0; x < arr.length; x++) {
                        arr[x] = arr[x].split(' ');
                    }
                    return encryptX(arr);
                }
            }
        }
        return false;
    }
})();