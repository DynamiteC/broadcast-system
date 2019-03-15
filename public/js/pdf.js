let dropArea = document.getElementById('drop-area');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
}

;
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
})

;
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
    dropArea.classList.add('highlight')
}

function unhighlight(e) {
    dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false)

function handleDrop(evt) {
    $('#demo-upload').prop('files', evt.dataTransfer.files);
    evt.preventDefault();
    $('#demo-upload').change();
}

$('#demo-upload').change(() => {
    $('#stream').prop('checked', true);
    $('#lattice').prop('checked', false);
    $('#extractBtn').prop('disabled', false);
});

$('#pages').change(() => {
    let re =
        /(?!([1-9]{1}[0-9]*)-(([1-9]{1}[0-9]*))-)^(([1-9]{1}[0-9]*)|(([1-9]{1}[0-9]*)(,|-|(,?([1-9]{1}[0-9]*))|(-?([1-9]{1}[0-9]*)){1})*))$/g;
    if (!re.test($('#pages').val()) && $('#pages').val() != '') {
        $("#pages").css('border', '2px red Solid');
    } else {
        $("#pages").css('border', '1px black Solid');
    }
})

$('#extractBtn').click(() => {
    let re =
        /(?!([1-9]{1}[0-9]*)-(([1-9]{1}[0-9]*))-)^(([1-9]{1}[0-9]*)|(([1-9]{1}[0-9]*)(,|-|(,?([1-9]{1}[0-9]*))|(-?([1-9]{1}[0-9]*)){1})*))$/g;
    if (!re.test($('#pages').val()) && $('#pages').val() != '') {
        $("#pages").css('border', '2px red Solid');
        return;
    } else {
        $("#pages").css('border', '1px black Solid');
    }
    handleFiles($('#demo-upload').prop('files'))
})

function handleFiles(files) {

    $('#infos').hide();
    $('#extData').html('');
    var fd = new FormData(),
        myFile = files[0];
    $('#extracting').show();
    $('#tablePdfs').empty();
    let method = ($('#stream').prop('checked')) ? 'stream' : 'lattice';
    let pages = ($('#pages').val() == '') ? 'all' : $('#pages').val();
    fd.append('filename', myFile.name);
    fd.append('ufile', myFile);
    fd.append('method', method);
    fd.append('pages', pages);
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('#csrf').val()
        }
    });
    axios.post('/pf', fd).then(res => {
        var response = res.data;
        if (response.err) {
            alert(response.err);
            $('#extracting').hide();
            return console.err(response.err);
        }

        var div = '',
            tbl = [];
        for (var x = 0; x < response.arr.length; x++) {
            div = '<h3>Page: ' + response.arr[x].page + '</h3>';
            tbl = response.arr[x].table;
            div += generateTableHtml(tbl, x)
            $('#tablePdfs').append(div);
        }
        $('#infos').show();
        $('#extracting').hide();
        $('.imgClickP').click((e) => {
            ($(e.target.parentNode.children[1]).prop('hidden', false));
            ($(e.target.parentNode.children[0]).prop('hidden', true));
        });
        $('.imgClickM').click((e) => {
            ($(e.target.parentNode.children[1]).prop('hidden', true));
            ($(e.target.parentNode.children[0]).prop('hidden', false));
        });
    });
}

function generateTableHtml(tbl, x) {
    let div = '';
    let flagFee = (window.location.href.indexOf('Fee') > -1) ? true : false;
    let colNos = 0;
    if (flagFee)
        colNos = $('#NoOfCols').val();
    for (var y = 0; y < tbl.length; y++) {
        let id = 'pg' + x + 'tbl' + y;
        div += '<div class="row tableBox">'
        div += '<h4><img class="imgClickP" src="/images/plus.svg" data-toggle="collapse" data-target="#' + id + '">'
        div += '<img class="imgClickM" src="/images/minus.svg" data-toggle="collapse" data-target="#' + id + '" hidden>'
        div += '</img>Table No: ' + (y + 1) + ' </h4></div>'
        let divRow = '<div class="container row collapse tableBox" id="' + id + '">'
        let table = '<table class="table table-sm table-bordered table-hover table-striped table-condensed">'
        table += '<thead class="thead-light">';
        data = tbl[y];
        let row = [];
        for (let r = 0; r < data.length; r++) {
            data[r].unshift('<input type="checkbox" class="Row' + id + '">');
        }
        for (let c = 0; c < data[0].length; c++) {
            if (c != 0) {
                let colsRowN = '';
                if (flagFee)
                    colsRowN = 'Col No:&nbsp;<input type=number min=0 max=' + colNos + ' class="No' + id + '"><br>';
                row.push(colsRowN + '<input type="checkbox" onchange="colChanged(this);" class="Col' + id + '">');
            } else {
                row.push('');
            }
        }
        data.unshift(row);
        for (let r = 0; r < data.length; r++) {
            table += '<tr>';
            for (let c = 0; c < data[r].length; c++) {
                let newId = (id + 'R' + r + 'C' + c);
                if (r == 0)
                    table += '<th id="' + newId + '">' + data[r][c] + '</th>';
                else
                    table += '<td id="' + newId + '">' + data[r][c] + '</td>';
            }
            table += '</tr>';
            if (r == 0)
                table += '</thead><tbody>'
        }
        table += '</tbody></table></div>';
        div += divRow;
        div += table;
    }
    return div;
}

$('#extractData').click(() => {

    let flagFee = (window.location.href.indexOf('Fee') > -1) ? true : false;
    let table = [],
        values = [];
    let inputs = $('#tablePdfs input[type=checkbox]');
    for (let x = 0; x < inputs.length; x++) {
        let tableId = $(inputs[x]).attr('class').replace('Row', '').replace('Col', '');
        if (table.indexOf(tableId) == -1)
            table.push(tableId);
    }
    if (!flagFee) {
        for (let x = 0; x < table.length; x++) {
            let tableRows = ($('#' + table[x] + ' tr'));
            let tableRowsChilds = [];
            for (let r = 1; r < tableRows.length; r++) {
                let temps = $(tableRows[r]).children();
                let len = tableRowsChilds.length;
                tableRowsChilds[len] = [];
                for (let c = 1; c < temps.length; c++) {
                    tableRowsChilds[len].push($(temps[c]).attr('id'));
                }
            }
            let rows = $('.Row' + table[x]);
            let cols = $('.Col' + table[x]);
            for (let r = 0; r < rows.length; r++) {
                if ($(rows[r]).prop('checked')) {
                    for (let c = 0; c < cols.length; c++) {
                        if ($(cols[c]).prop('checked')) {
                            if ($('#' + tableRowsChilds[r][c]).html().trim() != '')
                                values.push($('#' + tableRowsChilds[r][c]).html().trim());
                        }
                    }
                }
            }
        }
        $('#extData').html(values.join('\n'));
    } else {

        for (let x = 0; x < table.length; x++) {
            let tableRows = ($('#' + table[x] + ' tr'));
            let tableRowsChilds = [];
            for (let r = 1; r < tableRows.length; r++) {
                let temps = $(tableRows[r]).children();
                let len = tableRowsChilds.length;
                tableRowsChilds[len] = [];
                for (let c = 1; c < temps.length; c++) {
                    tableRowsChilds[len].push($(temps[c]).attr('id'));
                }
            }
            let rows = $('.Row' + table[x]);
            let cols = $('.Col' + table[x]);
            let colsNo = $('.No' + table[x]);
            for (let r = 0; r < rows.length; r++) {
                if ($(rows[r]).prop('checked')) {
                    let len = values.length;
                    values[len] = '';
                    for (let c = 0; c < cols.length; c++) {
                        let colsNox = $(colsNo[c]).val();
                        if ($(cols[c]).prop('checked') && colsNox != '') {
                            if ($('#' + tableRowsChilds[r][c]).html().trim() != '')
                                values[len] += ' ' + ($('#' + tableRowsChilds[r][c]).html().trim());
                            values[len].trim();
                        }
                    }
                }
            }
        }
        $('#extData').html(values.join('\n'));
    }
});

function colChanged(element) {
    let className = $(element).attr('class');
    let cols = $('.' + className),
        flagC = false;
    for (let x = 0; x < cols.length; x++) {
        if ($(cols[x]).prop('checked')) {
            flagC = true;
            break;
        }
    }
    let rowClassName = className.replace('Col', 'Row');
    if (!flagC) {
        let inputs = $('.' + rowClassName);
        for (let x = 0; x < inputs.length; x++) $(inputs[x]).prop('checked', false);
        return;
    }

    let rows = $('.' + rowClassName);
    let flag = true;
    for (let x = 0; x < rows.length; x++) {
        if ($(rows[x]).prop('checked')) {
            flag = false;
            break;
        }
    }
    if (flag) {
        let inputs = $('.' + rowClassName);
        for (let x = 0; x < inputs.length; x++)
            $(inputs[x]).prop('checked', true);
    }
}