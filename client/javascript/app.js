$(document).ready(function() {
    "use strict";

    $.ajax({

            type: "get",
            url: "/top",
            contentType: "application/json; charset=utf-8",
            dataType: "json",

        })
        .done(function(data, status) {
            var i = 0;
            $(".row").append("<table>");
            $(".row").append("<tr><th>URLs</th><th> Hits</th></tr>");
            for (i = 0; i < data.length; i++) {
                $(".row").append("<tr><td><a href='" + data[i].longurl + "' target='_blank'>" + data[i].longurl + "</a></td><td align='center'>" + data[i].views + "</td></tr>");

            }
            $(".row").append("</table>");
            console.log(status);
        })
        .fail(function(data, status) {
            console.log("Failed");
            console.log(data);
            console.log(status);
        });

    $("#button").click(function() {
        var url = $("#url").val().trim();
        if (url === "") {
            alert("Please enter the URL!");
        } else {
            var UserUrl = JSON.stringify({
                ogurl: url
            });
            $.ajax({

                    type: "POST",
                    url: "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: UserUrl
                })
                .done(function(data, status) {

                    $("#generateurl").html("");
                    $("#generateurl").append("<a href=" + data.url + ">" + data.url + "</a>");
                    console.log(status);
                })
                .fail(function(data, status) {
                    console.log("Failed");
                    console.log(data);
                    console.log(status);
                });
        }
    });
});