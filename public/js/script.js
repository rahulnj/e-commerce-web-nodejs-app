



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
                if (response.newUser) {
                    // alert("Form submitted successfully")
                    location.replace('/user-signin')
                } else {
                    $("#submit-message").html("User Exists");
                }

            },
            error: function (err) {
                // alert("Something Error")
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
    $.ajax({
        url: '/buy-checkout/' + proId,
        method: 'post',
        success: (response) => {
            // console.log(response.removeProduct);
            if (response) {
                // alert("Removed from bag")
                location.href = `/buy-checkout/${proId}`
            } else {

            }

        }
    })
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

                location.reload()

                // alert("Removed from bag")

            } else {
                console.log("changed")
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total-price').innerHTML = response.totalPrice
                document.getElementById('subtotal-price').innerHTML = response.totalPrice

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
            if (response.codsuccess) {
                location.href = '/success'
            } else {
                razorpayPayment(response)

            }
        }
    })
})

function razorpayPayment(order) {
    var options = {
        "key": "rzp_test_PJSf6jKqxyXIib", // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "PawPaw",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {

            verifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}

function verifyPayment(payment, order) {
    $.ajax({
        url: '/verify-payment',
        data: {
            payment,
            order
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                $.ajax({
                    url: '/deletefinalbag',
                    data: {
                        order
                    },
                    method: 'post',
                    success: (response) => {
                        location.href = '/success'
                    }
                })

            } else {
                alert("payment failed")
            }
        }
    })
}


$("#buynow-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: "/buy-place-order",
        method: "POST",
        data: $('#buynow-form').serialize(),
        success: (response) => {
            // alert(response)
            if (response.codsuccess) {
                location.href = '/success'
            } else {
                razorpayPayment(response)

            }
        }
    })
})



// address field validation
var nameadd = false; var addressadd = false; var cityadd = false; var placeadd = false; var pinadd = false; var phoneadd = false;

$("#nameadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 3 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#namerr").text("Invalid Name");
        nameadd = false;
    } else {
        nameadd = true;
        $("#namerr").text(" ");

    }
})
$("#addressadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 10 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#adderr").text("Invalid input");
        addressadd = false;
    } else {
        addressadd = true;
        $("#adderr").text(" ");

    }
})
$("#cityadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 4 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#cityerr").text("Invalid input");
        cityadd = false;
    } else {
        cityadd = true;
        $("#cityerr").text(" ");

    }
})
$("#placeadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 5 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#placerr").text("Invalid input");
        placeadd = false;
    } else {
        placeadd = true;
        $("#placerr").text(" ");

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

///buy now address
var nameadd = false; var addressadd = false; var cityadd = false; var placeadd = false; var pinadd = false; var phoneadd = false;

$("#nameadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 3 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#namerr").text("Invalid Name");
        nameadd = false;
    } else {
        nameadd = true;
        $("#namerr").text(" ");

    }
})
$("#addressadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 10 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#adderr").text("Invalid input");
        addressadd = false;
    } else {
        addressadd = true;
        $("#adderr").text(" ");

    }
})
$("#cityadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 4 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#cityerr").text("Invalid input");
        cityadd = false;
    } else {
        cityadd = true;
        $("#cityerr").text(" ");

    }
})
$("#placeadd").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 5 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#placerr").text("Invalid input");
        placeadd = false;
    } else {
        placeadd = true;
        $("#placerr").text(" ");

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
$('#buyaddressform').on("submit", (e) => {
    e.preventDefault()
    console.log(nameadd)
    console.log(addressadd)
    console.log(cityadd)
    console.log(placeadd)
    console.log(pinadd)
    console.log(phoneadd)
    let id = document.getElementById('proId').value
    console.log(id);
    if (nameadd == true && addressadd == true && cityadd == true && placeadd == true && pinadd == true && phoneadd == true) {
        $.ajax({
            url: "/buy-address/" + id,
            data: $("#buyaddressform").serialize(),
            method: "post",
            success: function (response) {
                // alert("Form submitted successfully")
                location.replace('/buy-checkout/' + id)
            },
            error: function (err) {
                // alert("Something Error")
            }
        })
    } else {
        $("#submit-message").html("Fill the Fields");
    }

})

//block user
function blockUser(userId, username) {
    Swal.fire({
        title: `Block ${username}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Block'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/users/block-user',
                data: {
                    userId,
                },
                method: 'post',
                success: (response) => {
                    if (response) {
                        location.reload()
                    } else {

                    }
                },
            })
        } else {

        }
    });

}

//unblock user
function unblockUser(userId, username) {
    Swal.fire({
        title: `Unblock ${username}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'UnBlock'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/users/unblock-user',
                data: {
                    userId,
                },
                method: 'post',
                success: (response) => {
                    if (response) {
                        location.reload()
                    } else {

                    }
                },
            })
        } else {

        }
    });
}
//Delete product admin
function deleteProduct(proId) {
    Swal.fire({
        title: "Delete this product ?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/admin/products/deleteproduct',
                data: {
                    proId,
                },
                method: 'post',
                success: (response) => {
                    if (response) {
                        location.reload()
                    } else {

                    }
                },
            })
        } else {

        }
    });
}
// edit email

async function editEmail() {
    const { value: email } = await Swal.fire({
        title: 'Enter new email ',
        input: 'email',

        inputPlaceholder: 'Enter your email address'
    })

    if (email) {
        Swal.fire(`Entered email: ${email}`)
        $.ajax({
            url: '/userprofile/editmail',
            data: {
                email,
            },
            method: 'post',
            success: (response) => {
                if (response.changed) {
                    Swal.fire(`Email Changed: ${email}`)
                    location.reload()
                } else {
                    Swal.fire(`Email already taken: ${email}`)
                }
            },
        })
    }


}

async function editPhone() {


    await Swal.fire({
        title: 'Enter new number',

        inputLabel: 'Your Phone Number',
        html: "<input id='swal-input2' type='number'  class='swal2-input' required maxlength='10'/>",
        inputAttributes: { maxlength: '10' },

    })

    var number = document.getElementById('swal-input2').value
    if (number.length == 10) {
        Swal.fire(`Entered email: ${number}`)
        $.ajax({
            url: '/userprofile/editPhone',
            data: {
                number,
            },
            method: 'post',
            success: (response) => {
                if (response.changed) {
                    Swal.fire(`Number Changed to: ${number}`)
                    location.reload()
                } else {
                    Swal.fire(`${number} has already taken`)
                }
            },
        })
    }

}