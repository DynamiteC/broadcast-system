(function () {
    if (window.location.href.toLowerCase().indexOf('/calculators') > -1) {
        google.charts.load('current', {
            'packages': ['corechart']
        });
        google.charts.setOnLoadCallback(drawGraph);
        var curage, retage, anncon, curbal, fees, empmat;
        var ratretdr, ratretwy, rateret;
        var inctaxrat, inctaxratbr, inctaxratdr;
        var annpre, lumpre, annspe, tempFeeDetail, tempAccountValDetail, feeDetailTable, accountValueDetailArray, duration;
        let nhref = window.location.href.replace('calculators', 'view');
        $('#g-t-inp').attr('href', nhref);

        function drawGraph(arr, element) {
            var a, ticks = [],
                x, data, options, val = 0,
                target, chart;
            if (arr == undefined)
                return;

            if (arr.length > 10)
                a = parseInt(arr.length / 10);
            else
                a = 1;

            for (x = 1; x < arr.length; x++) {

                ticks.push(Math.max(Math.max(arr[x][1], arr[x][2]), arr[x][3]));
                x = x + a - 1;
            }
            ticks.push(Math.max(Math.max(arr[arr.length - 1][1], arr[arr.length - 1][2]), arr[arr.length - 1][3]));
            ticks = ticks.sort(function (a, b) {
                return a - b;
            });
            target = ticks[ticks.length - 1];
            val = 0;
            dummy = [];
            for (x = 0; x < parseInt(ticks.length); x++) {
                dummy.push(val);
                diff = target - val;
                val = val + diff / (parseInt(ticks.length) - x);

            }
            dummy.push(val);
            dummy.push(val * 1.1);
            data = new google.visualization.arrayToDataTable(arr);
            options = {
                width: '100%',
                height: '100%',
                chartArea: {
                    width: '80%'
                },
                vAxis: {
                    format: 'currency',
                    ticks: dummy,
                    textStyle: {
                        fontSize: 8
                    }
                },
                hAxis: {},
                legend: {
                    position: 'right',
                    textStyle: {
                        fontSize: 10
                    }
                },
                annotations: {
                    alwaysOutside: true,
                    textStyle: {
                        fontSize: 12
                    }
                },
            };

            chart = new google.visualization.LineChart(element);
            chart.draw(data, options);
        }

        $('#start-year').change(function () {
            if ($("#start-year").val() == 2019 || $('#start-year').val() >= $('#end-year').val()) {
                $('#start-year').val(Number($('#end-year').val()) - 1);
            }
            showGraph();
        });

        $('#end-year').change(function () {
            if ($("#end-year").val() == 1930 || $('#end-year').val() <= $('#start-year').val()) {
                $('#end-year').val(Number($('#start-year').val()) + 1);
            }
            showGraph();
        });


        $('#investor-return').change(function () {
            showGraph();
        });
        $('#s-and-p').change(function () {
            showGraph();
        });

        var accountValue = function (ca, ra, pr, pf, yc, em, cab, dr) {
            let ty = ra - ca;
            let rate = 1 + ((pr / 100) - (pf / 100));
            let tc = yc + em;
            let tav = [];
            tav[0] = [];
            tav[0][0] = ca;
            tav[0][1] = cab;
            for (let x = 1; x < ty + 1; x++) {
                if (x > dr) {
                    rate = (1 + (pr / 100));
                    tc = 0;
                }
                tav.push([tav[x - 1][0] + 1, ((tav[x - 1][1] + tc) * rate)]);
            }
            return Math.round(tav[ty][1]);
        };
        var calculateTaxesTp = function (cA, nA, annualITP, tTD) {
            let left = tTD;
            for (let i = 0; i < (nA - cA); i++) {
                left = Math.round(left - annualITP);
            }
            return left;
        };

        var calculateRI = function (av, si, rr, age1, age2, tax) {
            if (age1 == age2)
                return av;
            let awd = si / (1 - (tax / 100));
            let rate = 1 + (rr / 100);
            let i = age2 - age1;
            let left = av;
            for (let x = 0; x < i; x++) {
                left = Math.round(((left * rate) - awd));
            }
            return (left < 0) ? 0 : left;
        };

        var calculateMaxRI = function (av, si, rr, age1, tax) {
            let awd = si / (1 - (tax / 100));
            let rate = 1 + (rr / 100);
            let left = av;
            while (left > 0 && age1 < 120) {
                left = Math.round(((left * rate) - awd));
                age1++;
            }
            return age1;
        };

        var calculateMaxRII = function (arr, age) {
            for (var x = 0; x < arr.length; x++) {
                if (arr[x] == '')
                    break;
                else
                    age++;
            }
            return --age;
        };

        var calculateAnnualFeesT = function (cA, nA, yC, rR, pF, cAB, dr) {

            let t = yC + cAB;
            let rate1 = 1 + ((rR / 100) - (pF / 100));
            let rate2 = 1 + (rR / 100);
            let tY = nA - cA;
            if (tY == 0) {
                return Math.round((t * rate2 - t * rate1) * rate2);
            }
            let tAV = [];
            tAV[0] = [];
            tAV[0][0] = t * rate1;
            tAV[0][1] = t * rate2;
            for (let x = 1; x < tY + 1; x++) {
                tAV[x] = [];
                if (x >= dr)
                    rate1 = (1 + (rR / 100));
                tAV[x][0] = (tAV[x - 1][0] + yC) * rate1;
                tAV[x][1] = (tAV[x - 1][0] + yC) * rate2;
            }
            return (Math.round(tAV[tY][1] - tAV[tY][0]) * rate2);
        };

        var calculateTotalFeesT = function (cA, nA, yC, rR, pF, cAB, dr) {
            let t = yC + cAB;
            let rate1 = 1 + ((rR / 100) - (pF / 100));
            let rate2 = 1 + (rR / 100);
            let tY = nA - cA;
            if (tY == 0) {
                return Math.round((t * rate2 - t * rate1) * rate2);
            }
            let tAV = [];
            tAV[0] = [];
            tAV[0][0] = t * rate1;
            tAV[0][1] = t * rate2;
            let totalFeesPaid = ((tAV[0][1] - tAV[0][0]) * rate2);
            for (let x = 1; x < tY + 1; x++) {
                tAV[x] = [];
                if (x >= dr)
                    rate1 = (1 + (rR / 100));
                tAV[x][0] = ((tAV[x - 1][0] + yC) * rate1);
                tAV[x][1] = ((tAV[x - 1][0] + yC) * rate2);
                totalFeesPaid = (totalFeesPaid + (tAV[x][1] - tAV[x][0]) * rate2);
            }
            return Math.round(totalFeesPaid);
        };

        var calculateAnnualFeesI = function (ca, na) {
            let ty = na - ca;
            return Math.round(Math.round(anyToNumber(feeDetailTable[ty][0])) + Math.round(anyToNumber(feeDetailTable[ty][1])) + Math.round(anyToNumber(feeDetailTable[ty][2])));
        };

        var calculateTotalFeesI = function (ca, na) {
            let ty = na - ca;
            let tfp = 0;
            for (let x = 0; x < ty + 1; x++)
                tfp += Math.round(anyToNumber(feeDetailTable[x][0])) + Math.round(anyToNumber(feeDetailTable[x][1])) + Math.round(anyToNumber(feeDetailTable[x][2]));

            return Math.round(tfp);
        };

        $(window).resize(function () {
            showGraph();
        });

        function showGraph() {
            {
                $.post("/graph", {
                        Func: 'graph',
                        startYear: $('#start-year').val(),
                        endYear: $('#end-year').val(),
                        iR: $('#investor-return').val(),
                        sp: $('#s-and-p').val(),
                        startAmt: 100000
                    },
                    function (data) {
                        mainObj = JSON.parse(data);
                        var years = [],
                            sFc = [],
                            iR = [],
                            sP = [];
                        var dataX = mainObj.data;
                        var finalData = [];
                        finalData.push(['Years', 'S&P', mainObj.mainspfcname, 'Investor Return']);
                        for (var x = 0; x < dataX.length; x++) {
                            years.push(dataX[x].year);
                            sP.push(dataX[x].sp);
                            sFc.push(dataX[x].spfc);
                            iR.push(dataX[x].ir);
                            finalData.push([dataX[x].year.toString().replace(/\,/g, ''), parseInt(dataX[x].sp), parseInt(dataX[x].spfc), parseInt(dataX[x].ir)]);
                        }
                        if (finalData.length > 0) {
                            drawGraph(finalData, document.getElementById('graphCanvas'));
                            $('#endAmtSP').html((mainObj.endAmtSP));
                            $('#endAmtSPFC').html((mainObj.endAmtSPFC));
                            $('#endAmtIR').html((mainObj.endAmtIR));
                            $('#avgAmtSP').html((mainObj.avgAmtSP));
                            $('#avgAmtSPFC').html((mainObj.avgAmtSPFC));
                            $('#avgAmtIR').html((mainObj.avgAmtIR));
                            $('#cmpAmtSP').html((mainObj.cmpAmtSP));
                            $('#cmpAmtSPFC').html((mainObj.cmpAmtSPFC));
                            $('#cmpAmtIR').html((mainObj.cmpAmtIR));
                        }
                    }
                );
            }
        }

        function showData() {
            $.post("/prcft", {
                    url: window.location.href
                },
                function (data) {

                    data = JSON.parse(data);
                    var i, x, outputs;
                    curage = data.currAge;
                    retage = data.ageAtRetirement;
                    anncon = Number(data.annualContribution.replace(/,/g, ''));
                    anncon *= (data.annOrMon) ? 1 : 12;
                    duration = data.duration;
                    curbal = Number(data.currAccountBalance.replace(/,/g, ''));
                    fees = data.percentFees;
                    empmat = Number(data.employerMatch.replace(/,/g, ''));
                    ratretdr = data.rateOfReturnRetirement;
                    ratretwy = data.rateOfReturnWorking;
                    rateret = data.rateOfReturn;
                    inctaxrat = data.incomeTaxRateIUL;
                    inctaxratbr = data.incomeTaxRateBefore;
                    inctaxratdr = data.incomeTaxRateDuring;
                    annpre = Number(data.annualPremium.replace(/,/g, ''));
                    lumpre = Number(data.lumpSumPremium.replace(/,/g, ''));
                    annspe = Number(data.annualSpendableIncome.replace(/,/g, ''));
                    tempFeeDetail = data.iulFeeDetail;
                    tempAccountValDetail = data.iulAcctValDetail;
                    var feeDetailArray = tempFeeDetail.split("\n");
                    feeDetailTable = [];
                    for (i = 0; i < feeDetailArray.length; i++) {
                        feeDetailTable[i] = String(feeDetailArray[i]).split(" ");
                    }

                    var temp = tempAccountValDetail.split("\n");
                    accountValueDetailArray = [];
                    for (i = 0; i < temp.length; i++) {
                        accountValueDetailArray.push(temp[i]);
                    }

                    $('#AccValIULY').html(numberToCurrency(Number((accountValueDetailArray[retage - curage]).replace(/,/g, '').replace('$', ''))));
                    $('#AccValIULX').html(numberToCurrency(Number((accountValueDetailArray[retage - curage]).replace(/,/g, '').replace('$', ''))));

                    $('#EmpMatTab2').html(numberToCurrency(empmat)); {
                        outputs = $(".CurAgeTab");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(curage);
                    } {
                        outputs = $(".RetAgeTab");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(retage);
                    } {
                        outputs = $(".IncTaxBR");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(inctaxratbr.toString() + '%');
                    } {
                        outputs = $(".IncTaxDR");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(inctaxratdr.toString() + '%');
                    } {
                        outputs = $(".IncTax");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(inctaxrat.toString() + '%');
                    } {
                        outputs = $(".AnnConn");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(anncon));
                    } {
                        outputs = $(".AnnPre");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(annpre));
                    } {
                        outputs = $(".CurrAccBal");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(curbal));
                    } {
                        outputs = $(".LumSumPre");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(lumpre));
                    } {
                        outputs = $(".Fees");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(fees.toString() + '%');
                    } {
                        outputs = $(".RatRetWY");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(ratretwy.toString() + '%');
                    } {
                        outputs = $(".RateRet");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(rateret.toString() + '%');

                        $('#RatRetDR').html(ratretdr.toString() + '%');
                    } {
                        outputs = $(".AnnSpe");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(annspe));

                    }
                    var totalConn = ((retage - curage) * anncon) + curbal;
                    var totalPrem = ((retage - curage) * annpre) + lumpre; {
                        outputs = $(".TotConn");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(totalConn));
                    } {
                        outputs = $(".TotPre");
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(totalPrem));
                    }
                    var annWithDraw = (annspe / (1 - (inctaxratdr / 100))); {
                        outputs = $('.AnnWithDraw');
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(Math.round(annWithDraw)));
                    }
                    var accVal = accountValue(curage, retage, ratretwy, fees, anncon, empmat, curbal, duration); {
                        $('#AccValTPX').html(numberToCurrency(accVal));
                        $('#AccValTPY').html(numberToCurrency(accVal));
                        $('#TotSpeIncT').html(numberToCurrency(0));
                        $('#TotSpeIncI').html(numberToCurrency(0));
                    }
                    var anntaxdef = Math.round(anncon * (inctaxratbr / 100));
                    var tottaxdef = Math.round((retage - curage) * anntaxdef);
                    var anntaxpd = Math.round((1200 + (anncon - 4800)));
                    var tottaxpd = Math.round((retage - curage) * anntaxpd); {
                        $('#AnnDefTab4').html(numberToCurrency(anntaxdef));
                        $('#TotDefTab4').html(numberToCurrency(tottaxdef));
                        $('#TotTaxDef').html(numberToCurrency(tottaxdef));
                        $('#AnnPaidTab4').html(numberToCurrency(anntaxpd));
                        $('#TotTaxPaidTab4').html(numberToCurrency(tottaxpd));
                        $('#TotTaxPaid').html(numberToCurrency(tottaxpd));
                        outputs = $('.AnnIncTaxPS');
                        for (x = 0; x < outputs.length; x++)
                            $(outputs[x]).html(numberToCurrency(Math.round(annWithDraw - annspe)));
                        $('#TotIncTaxSave').html(numberToCurrency(0));
                        $('#TotIncTaxPaid').html(numberToCurrency(0));
                    }
                    var annualXYZI = calculateAnnualFeesI(curage, curage);
                    var totalXYZI = calculateTotalFeesI(curage, curage);
                    $('#AnnualFeesI').html(numberToCurrency(annualXYZI));
                    $('#TotalFeesI').html(numberToCurrency(totalXYZI));
                    var annualXYZT = calculateAnnualFeesT(curage, curage, anncon, ratretwy, fees, curbal, duration);
                    $('#AnnualFeesT').html(numberToCurrency(annualXYZT));
                    var totalXYZT = calculateTotalFeesT(curage, curage, anncon, ratretwy, fees, curbal, duration);
                    $('#TotalFeesT').html(numberToCurrency(totalXYZT));
                    var max1 = calculateMaxRI(accVal, annspe, ratretdr, retage, inctaxratdr);
                    var max2 = calculateMaxRII(accountValueDetailArray, curage);
                    var max3 = curage + feeDetailTable.length - 1;

                    $('#retAgeInputTP').val(retage);
                    $('#retAgeInputTP').attr('min', retage);
                    $('#retAgeInputTP').attr('max', max1);
                    $('#retAgeInputIUL').val(retage);
                    $('#retAgeInputIUL').attr('min', retage);
                    $('#retAgeInputIUL').attr('max', max2);
                    $('#taxAgeInputTP').val(retage);
                    $('#taxAgeInputTP').attr('min', retage);
                    $('#taxAgeInputTP').attr('max', max1);
                    $('#taxAgeInputIUL').val(retage);
                    $('#taxAgeInputIUL').attr('min', retage);
                    $('#taxAgeInputIUL').attr('max', 120);
                    $('#feeAgeInputTP').val(curage);
                    $('#feeAgeInputTP').attr('min', curage);
                    $('#feeAgeInputTP').attr('max', max1);
                    $('#feeAgeInputIUL').val(curage);
                    $('#feeAgeInputIUL').attr('min', curage);
                    $('#feeAgeInputIUL').attr('max', max3);
                }
            );
        }
        $('input[type=number]').click(function (e) {
            $('#' + e.target.id).change();
        });
        $('#retAgeInputTP').change(function () {
            var min = Number($('#retAgeInputTP').attr('min'));
            var max = Number($('#retAgeInputTP').attr('max'));
            var val = Number($('#retAgeInputTP').val());
            val = (min > val) ? min : val;
            $('#retAgeInputTP').val(val);
            val = (max < val) ? max : val;
            $('#retAgeInputTP').val(val);
            var tav = 0;
            var rr = anyToNumber($('#RatRetDR').html());
            var av = anyToNumber($('#AccValTPX').html());
            var tax = anyToNumber($('.IncTaxDR').html());
            var outputs;
            if (val != max) {
                tav = calculateRI(av, annspe, rr, min, val, tax);
                $('#AccValTPY').css('background-color', '#375383');
                outputs = $(".AnnSpe");
                $(outputs[0]).html(numberToCurrency(annspe));
                $(outputs[0]).css('background-color', '#375383');
                $('#EmptyError1').css("visibility", "hidden");
            } else {
                $('#AccValTPY').css('background-color', '#cc0000');
                outputs = $(".AnnSpe");
                $(outputs[0]).html(numberToCurrency(0));
                $(outputs[0]).css('background-color', '#cc0000');
                $('#EmptyError1').css("visibility", "visible");
            }

            $('#AccValTPY').html(numberToCurrency(tav));
            $('#TotSpeIncT').html(numberToCurrency((val - min) * annspe));
        });
        $('#retAgeInputIUL').change(function () {
            var min = Number($('#retAgeInputIUL').attr('min'));
            var max = Number($('#retAgeInputIUL').attr('max'));
            var val = Number($('#retAgeInputIUL').val());
            val = (min > val) ? min : val;
            $('#retAgeInputIUL').val(val);
            val = (max < val) ? max : val;
            $('#retAgeInputIUL').val(val);
            $('#AccValIULY').html(numberToCurrency(Number((accountValueDetailArray[val - curage]).replace(/,/g, '').replace('$', ''))));
            $('#TotSpeIncI').html(numberToCurrency((val - min) * annspe));
        });
        $('#taxAgeInputTP').change(function () {
            var min = Number($('#taxAgeInputTP').attr('min'));
            var max = Number($('#taxAgeInputTP').attr('max'));
            var val = Number($('#taxAgeInputTP').val());
            val = (min > val) ? min : val;
            $('#taxAgeInputTP').val(val);
            val = (max < val) ? max : val;
            $('#taxAgeInputTP').val(val);
            var anntaxdef = Math.round(anncon * (inctaxratbr / 100));
            var tottaxdef = Math.round((retage - curage) * anntaxdef);
            var paid = anyToNumber($('.AnnIncTaxPS').html());
            var deffered = calculateTaxesTp(min, val, paid, tottaxdef);
            if (deffered < 0 || val == max) {
                $('#EmptyError2').css("visibility", "hidden");
                if (val == max) {
                    $('#EmptyError2').css("visibility", "visible");
                }
                $('#TotTaxDef').css('background-color', '#cc0000');
            } else {
                $('#EmptyError2').css("visibility", "hidden");
                $('#TotTaxDef').css('background-color', '#375383');
            }
            $('#TotTaxDef').html(numberToCurrency(deffered));
            $('#TotIncTaxPaid').html(numberToCurrency((val - min) * paid));
        });
        $('#taxAgeInputIUL').change(function () {
            var min = Number($('#taxAgeInputIUL').attr('min'));
            var max = Number($('#taxAgeInputIUL').attr('max'));
            var val = Number($('#taxAgeInputIUL').val());
            val = (min > val) ? min : val;
            $('#taxAgeInputIUL').val(val);
            val = (max < val) ? max : val;
            $('#taxAgeInputIUL').val(val);
            var saved = anyToNumber($('.AnnIncTaxPS').html());
            $('#TotIncTaxSave').html(numberToCurrency((val - min) * saved));
        });
        $('#feeAgeInputTP').change(function () {
            var min = Number($('#feeAgeInputTP').attr('min'));
            var max = Number($('#feeAgeInputTP').attr('max'));
            var val = Number($('#feeAgeInputTP').val());
            val = (min > val) ? min : val;
            $('#feeAgeInputTP').val(val);
            val = (max < val) ? max : val;
            $('#feeAgeInputTP').val(val);
            if (val != max) {
                $('#EmptyError3').css("visibility", "hidden");
                var annualXYZT = calculateAnnualFeesT(min, val, anncon, ratretwy, fees, curbal, duration);
                $('#AnnualFeesT').html(numberToCurrency(Math.round(annualXYZT)));
                var totalXYZT = calculateTotalFeesT(min, val, anncon, ratretwy, fees, curbal, duration);
                $('#TotalFeesT').html(numberToCurrency(totalXYZT));
            } else {
                $('#EmptyError3').css("visibility", "visible");
                $('#AnnualFeesT').html(numberToCurrency(0));
            }


        });
        $('#feeAgeInputIUL').change(function () {
            var min = Number($('#feeAgeInputIUL').attr('min'));
            var max = Number($('#feeAgeInputIUL').attr('max'));
            var val = Number($('#feeAgeInputIUL').val());
            val = (min > val) ? min : val;
            $('#feeAgeInputIUL').val(val);
            val = (max < val) ? max : val;
            $('#feeAgeInputIUL').val(val);
            var annual = calculateAnnualFeesI(min, val);
            var total = calculateTotalFeesI(min, val);
            $('#AnnualFeesI').html(numberToCurrency(annual));
            $('#TotalFeesI').html(numberToCurrency(total));
        });

        function loadOptions() {
            $('#start-year').empty();
            $('#end-year').empty();
            var year = 1930,
                selectedE, selectedS;

            while (year <= 2019) {
                selectedS = (year == 1930) ? 'selected' : '';
                selectedE = (year == 2019) ? 'selected' : '';
                $('#start-year').append($('<option value="' + year + '" ' + selectedS + '>' + year + '</option>'));
                $('#end-year').append($('<option value="' + year + '" ' + selectedE + '>' + year + '</option>'));
                year++;
            }
            $('#investor-return').empty();
            $('#s-and-p').empty();
            var i = 0;
            while (i <= 20) {

                selectedS = (i == 3) ? 'selected' : '';
                selectedE = (i == 14) ? 'selected' : '';
                if (i <= 10)
                    $('#investor-return').append($('<option value="' + i + '" ' + selectedS + '>' + i + ' %</option>'));
                $('#s-and-p').append($('<option value="' + i + '" ' + selectedE + '>' + i + ' %</option>'));
                i++;
            }
            showGraph();
            showData();
        }

        if (window.localStorage.getItem('tab') != null) {
            var tabId = window.localStorage.getItem('tab');
            $('a.nav-link').each(function () {
                $(this).removeClass('active');
            });
            $('a.nav-link').each(function () {
                if ($(this).attr('href') == ('#' + tabId)) {
                    $(this).addClass('active')
                }
            });
            $('#tab1').removeClass('active');
            $('#tab1').removeClass('show');
            $('#' + tabId).addClass('active');
            $('#' + tabId).addClass('show');
        }

        $('ul').click(function () {
            window.localStorage.clear();
            window.localStorage.setItem('tab', (($('.active.show')[0].localName == 'div') ? $('.active.show')[0].id : $('.active.show')[1].id));
            window.localStorage.setItem('tab', (($('.active.show')[0].localName == 'div') ? $('.active.show')[0].id : $('.active.show')[1].id));
            window.localStorage.setItem('tab', (($('.active.show')[0].localName == 'div') ? $('.active.show')[0].id : $('.active.show')[1].id));
        });

        $('#g-t-inp').click(function () {
            window.localStorage.clear();
            window.localStorage.setItem('tab', (($('.active.show')[0].localName == 'div') ? $('.active.show')[0].id : $('.active.show')[1].id));
            window.localStorage.setItem('tab', (($('.active.show')[0].localName == 'div') ? $('.active.show')[0].id : $('.active.show')[1].id));
            window.localStorage.setItem('tab', (($('.active.show')[0].localName == 'div') ? $('.active.show')[0].id : $('.active.show')[1].id));
        });
    }

    if (window.location.href.toLowerCase().indexOf('/calculators') == -1) {
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
                                    name: name
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
                            iav: iav.toString()
                        });

                    } else {
                        $('#s-c-calc').html('<i class="fa fa-circle-o-notch fa-spin" style="font-size:inherit;"></i>&nbsp;Create Calculators');
                        $.post('/cr-calc', {
                            inp: inputsD.join(';;'),
                            ifd: ifd.toString(),
                            iav: iav.toString()
                        });
                    }
                    window.location.href = "/home/profile/calculators/?name=" + inputsD[0].split('::')[1];
                }
            } else {
                window.location.href = "/home/profile/calculators/?name=" + pName;
            }
        });
    }

    if (window.location.href.toLowerCase().indexOf('/calculators') > -1)
        window.onload = loadOptions;

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