


// form validation
var submitname = false; var submitemail = false; var submitpassword = false; submitphone = false;
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
    $('#phonesu').on('input', function () {
        this.value = this.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');
        var phone = $(this).val()
        if (phone.length < 10) {
            submitphone = false;
            $("#error-phone").html("Invalid Number");

        } else {
            submitphone = true;
            $("#error-phone").html(" ");

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
    console.log(submitphone)
    if (submitname == true && submitemail == true && submitpassword == true && submitphone == true) {
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



function addTobag(proId) {
    $.ajax({
        url: '/add-to-bag/' + proId,
        method: 'get',
        success: (response) => {
            // console.log(response)
            if (response.status) {
                // location.reload()
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Added to Bag'
                }).then((res) => {
                    location.reload()
                })

            } else {
                location.href = "/user-signin"
            }

        }
    })
}
//
function buynow(proId) {

}




















//To change quantity
function changeQuantity(cartId, proId, userId, count) {
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    $.ajax({
        url: '/change-quantity',
        data: {

            cart: cartId,
            product: proId,
            user: userId,
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
                console.log("changed")
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total-price').innerHTML = response.totalPrice
                document.getElementById('subtotal-price').innerHTML = response.totalPrice
                window.location.reload()
            }

        }
    })
}

// deleteItem
function deleteItem(cartId, proId) {
    // console.log(cartId, proId)
    Swal.fire({
        title: 'Remove from Bag?',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Remove'
    }).then((result) => {
        if (result.isConfirmed) {
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
                    } else {

                    }
                },
            })
        } else {

        }
    });
}




$("#checkout-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: "/place-order",
        method: "POST",
        data: $('#checkout-form').serialize(),
        success: (response) => {
            // alert(response)
            location.href = '/success'
        }
    })
})

// address field validation
var nameadd = false; var addressadd = false; var cityadd = false; var placeadd = false; var pinadd = false; var phoneadd = false;

$("#nameadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 3 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#").text("Invalid Name");
        nameadd = false;
    } else {
        nameadd = true;
        $("#").text(" ");

    }
})
$("#addressadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 10 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#").text("Invalid Name");
        addressadd = false;
    } else {
        addressadd = true;
        $("#").text(" ");

    }
})
$("#cityadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 5 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#").text("Invalid Name");
        cityadd = false;
    } else {
        cityadd = true;
        $("#").text(" ");

    }
})
$("#placeadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 5 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#").text("Invalid Name");
        placeadd = false;
    } else {
        placeadd = true;
        $("#").text(" ");

    }
})
$("#pinadd").on('input', function () {
    this.value = this.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');
    var name = $(this).val()
    if (name.length < 6) {
        $("#pinerr").text("Invalid pincode");
        pinadd = false;
    } else {
        pinadd = true;
        $("#pinerr").text(" ");

    }
})
$('#phoneadd').on('input', function () {
    this.value = this.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');
    var phone = $(this).val()
    if (phone.length < 10) {
        phoneadd = false;
        $("#phnerr").html("Invalid Number");

    } else {
        phoneadd = true;
        $("#phnerr").html(" ");

    }
})
$('#addressform').on("submit", (e) => {
    e.preventDefault()
    console.log(nameadd)
    console.log(addressadd)
    console.log(cityadd)
    console.log(placeadd)
    console.log(pinadd)
    console.log(phoneadd)
    if (nameadd == true && addressadd == true && cityadd == true && placeadd == true && pinadd == true && phoneadd == true) {
        $.ajax({
            url: "/add-address",
            data: $("#addressform").serialize(),
            method: "post",
            success: function (response) {
                // alert("Form submitted successfully")
                location.replace('/checkout')
            },
            error: function (err) {
                alert("Something Error")
            }
        })
    } else {
        $("#submit-message").html("Fill the Fields");
    }

})







