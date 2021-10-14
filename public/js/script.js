
// form validation
var submitname = false; var submitemail = false; var submitpassword = false;
var mailRegx = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
$(document).ready(function () {
    $("#usersu").on('input', function () {
        this.value = this.value.replace(/[^ a-zA-Z]/, '');
        var name = $(this).val()
        if (name.length < 3 || name.includes('  ') || name.charAt(0) == ' ') {
            $("#error-name").text("Invalid Name");
            submitname = false;
        } else {
            submitname = true;
            $("#error-name").text(" ");

        }
    })
    $('#mailsu').blur(function () {
        var email = $(this).val()
        if (!email.match(mailRegx)) {
            $("#error-email").text("Invalid E-mail");
            submitemail = false;
        } else {
            submitemail = true;
            $("#error-email").text(" ");

        }
    })
    $('#passwordsu').blur(function () {
        var password = $(this).val()
        if (password.length <= 2 && password.includes('')) {
            $("#error-password").text("Min 3 input needed");
            submitpassword = false;
        } else {
            submitpassword = true;
            $("#error-password").text(" ");
        }
    })
})
$('#signupform').on("submit", (e) => {
    e.preventDefault()
    console.log(submitname)
    console.log(submitemail)
    console.log(submitpassword)
    if (submitname == true && submitemail == true && submitpassword == true) {
        $.ajax({
            url: "/signup",
            data: $("#signupform").serialize(),
            method: "post",
            success: function (response) {
                // alert("Form submitted successfully")
                location.replace('/user-signin')
            },
            error: function (err) {
                alert("Something Error")
            }
        })
    } else {
        $("#submit-message").html("Fill the Fields");
    }

})


// to search
function myFunction() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("userTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}


// 
// function addTobag(proId) {
//     $.ajax({
//         url: '/add-to-bag/' + proId,
//         method: 'get',
//         success: (response) => {
//             console.log(response)
//             if (response.status) {
//                 let count = $('#bag-count').html()
//                 console.log(count)
//                 count = parseInt(count) + 1
//                 $("#bag-count").html(count)
//             }
//             // alert(response)
//             // location.href = "/dogretailvet"
//         }
//     })
// }
//

//To change quantity
function changeQuantity(cartId, proId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    $.ajax({
        url: '/change-quantity',
        data: {

            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            // console.log(response.removeProduct);
            if (response.removeProduct) {
                // alert("Removed from bag")
                location.reload()
            } else {
                document.getElementById(proId).innerHTML = quantity + count

            }

        }
    })
}

// deleteItem
function deleteItem(cartId, proId) {
    // console.log(cartId, proId)
    $.ajax({
        url: '/delete-item',
        data: {
            cart: cartId,
            product: proId,
        },
        method: 'post',
        success: (response) => {
            if (response) {
                // alert("Deleted")
                location.reload()
            }
        }
    })
}


// add product validation








