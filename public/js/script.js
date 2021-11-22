



// form validation
var submitname = false; var submitemail = false; var submitpassword = false;
var mailRegx = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
$(document).ready(function () {
    $("#usersu").blur(function () {
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
    if (submitname == true && submitemail == true && submitpassword == true) {
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
        td = tr[i].getElementsByTagName("td")[1];
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
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                        document.getElementById('bag-count').innerHTML = response.count
                    }
                })
                Toast.fire({
                    icon: 'success',
                    title: 'Added to Bag'
                }).then((res) => {
                    // location.reload()
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
    let value = parseInt(document.getElementById(proId).innerHTML)

    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    if (value == 1 && count == -1) {
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
                            //


                            location.reload()

                            //
                            // location.reload()

                            // alert("Removed from bag")

                        } else {
                            // location.reload()
                            document.getElementById(proId).innerHTML = quantity + count
                            document.getElementById('total-price').innerHTML = response.Total
                            document.getElementById('subtotal-price').innerHTML = response.Total
                            if (response.subtotal[0].offertotal) {
                                document.getElementById(`${proId}subtotal`).innerHTML = "₹" + response.subtotal[0].offertotal

                            } else {
                                document.getElementById(`${proId}subtotal`).innerHTML = "₹" + response.subtotal[0].total
                            }

                        }

                    }
                })
            }
        });
    } else {
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

                if (response.removeProduct) {
                    //


                    location.reload()



                } else {
                    // location.reload()
                    document.getElementById(proId).innerHTML = quantity + count
                    document.getElementById('total-price').innerHTML = response.Total
                    document.getElementById('subtotal-price').innerHTML = response.Total
                    if (response.subtotal[0].offertotal) {
                        document.getElementById(`${proId}subtotal`).innerHTML = "₹" + response.subtotal[0].offertotal

                    } else {
                        document.getElementById(`${proId}subtotal`).innerHTML = "₹" + response.subtotal[0].total
                    }

                }

            }
        })
    }
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


var newcoupon;

$("#checkout-form").submit((e) => {
    e.preventDefault();
    let data;
    if (newcoupon) {
        data = $('#checkout-form').serialize() + "&couponCode=" + newcoupon;

    } else {
        data = $('#checkout-form').serialize() + "&couponCode=" + false;

    }


    $.ajax({
        url: "/place-order",
        method: "POST",
        data: data,
        success: (response) => {
            // alert(response)
            if (response.codsuccess) {
                location.href = '/success'
            } else if (response.razorpay) {
                razorpayPayment(response.res)

            } else if (response.paypalsuccess) {

                location.href = response.link
            } else if (response.noaddress) {
                Swal.fire("Choose a address")
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
        },
        "modal": {
            "ondismiss": function () {
                console.log("delete" + order.receipt);
                deleteOrder(order.receipt)
            }
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
            if (response) {
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

function deleteOrder(orderId) {
    console.log("ello");
    $.ajax({
        url: "/deletefakeorder",
        method: "post",
        data: { id: orderId },
        success: function () {

        },
        error: function () {

        }

    })

}













var newcoupon;
$("#buynow-form").submit((e) => {
    e.preventDefault()
    let data;
    if (newcoupon) {
        data = $('#buynow-form').serialize() + "&couponCode=" + newcoupon;

    } else {
        data = $('#buynow-form').serialize() + "&couponCode=" + false;

    }
    $.ajax({
        url: "/buy-place-order",
        method: "POST",
        data: data,
        success: (response) => {
            // alert(response)
            if (response.codsuccess) {
                location.href = '/success'
            } else if (response.razorpay) {
                razorpayPayment(response.res)

            } else if (response.paypalsuccess) {
                location.href = response.link

            } else if (response.noaddress == true) {
                Swal.fire("Choose a address")
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
    if (phone.length < 10 || phone.length > 10) {
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
                if (response.procheck) {
                    location.replace('/userprofile')
                } else {
                    location.replace('/checkout')
                }
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
                    setTimeout(() => { location.reload() }, 2000)
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
                    setTimeout(() => { location.reload() }, 2000)

                } else {
                    Swal.fire(`Account exists in this number${number}`)
                }
            },
        })
    }

}

// change password
async function changePassword() {


    await Swal.fire({
        title: 'Enter old Password',
        confirmButtonColor: '#d33',
        inputLabel: 'Your Phone Number',
        html: "<input id='swal-input3' type='password'  class='swal2-input' required maxlength='10'/>",
        inputAttributes: { maxlength: '10' },

    })

    var password = document.getElementById('swal-input3').value
    if (password.length > 2 && !password.includes(' ')) {

        $.ajax({
            url: '/userprofile/change-password',
            data: {
                password,
            },
            method: 'post',
            success: (response) => {
                console.log(response)
                if (response.changed == true) {
                    second();
                } else if (response.changed == false) {
                    Swal.fire({
                        title: 'Wrong password enter again',
                        confirmButtonColor: '#d33',
                    })
                }
            },
        })
    } else {
        Swal.fire(`Invalid Password`)
    }
}


async function second() {
    await Swal.fire({
        title: 'Enter new Password',
        confirmButtonColor: '#d33',
        inputLabel: 'Your Phone Number',
        html: "<input id='swal-input4' type='password'  class='swal4-input' maxlength='10'/>",
        inputAttributes: { maxlength: '10' },

    })
    var password = document.getElementById('swal-input4').value

    if (password.length > 2 && !password.includes(' ')) {
        Swal.fire(`Changed password: ${password}`)
        $.ajax({
            url: '/userprofile/create-password',
            data: {
                password,
            },
            method: 'post',
            success: (response) => {
                if (response.changed == true) {
                    Swal.fire(`Password successfully Changed`)

                    // location.reload()
                }
            },
        })

    } else {
        Swal.fire(`Invalid Password`)
    }
}

document.getElementById('maincat').onchange = e => {
    console.log(e.target.value)
    let detail = e.target.value
    $.ajax({
        url: "/admin/getSubcategory",
        method: "POST",
        data: { detail },
        success: function (response) {
            console.log(response.category.subcategory[0])
            document.getElementById('subcategory').innerHTML = '';
            document.getElementById('subtype').innerHTML = '';
            // console.log(response.category.type[0])
            for (let i = 0; i < response.category.subcategory.length; i++) {
                let element = `<option value= "${response.category.subcategory[i].name}" > ${response.category.subcategory[i].name} </option>`
                let typeelement = `<option value= "${response.category.type[i].name}" > ${response.category.type[i].name} </option>`
                document.getElementById('subcategory').innerHTML += element
                document.getElementById('subtype').innerHTML += typeelement
            }

        }
    })

}

async function createPassword() {


    await Swal.fire({
        title: 'Enter new Password',
        confirmButtonColor: '#d33',
        inputLabel: 'Your Phone Number',
        html: "<input id='swal-input3' type='password'  class='swal2-input' required maxlength='10'/>",
        inputAttributes: { maxlength: '10' },

    })

    var password = document.getElementById('swal-input3').value
    if (password.length > 2 && !password.includes(' ')) {
        Swal.fire(`Changed password: ${password}`)
        $.ajax({
            url: '/userprofile/create-password',
            data: {
                password,
            },
            method: 'post',
            success: (response) => {
                if (response.changed) {
                    Swal.fire(`Password Changed`)

                    location.reload()
                } else {
                    Swal.fire(`Enter again`)
                }
            },
        })
    } else {
        Swal.fire(`Invalid Password`)
    }

}

var product_name = false; var product_des = false; var product_price = false; product_qty = false;
$("#product_name").on('input', function () {
    this.value = this.value.replace(/[^ a-zA-Z]/, '');
    var name = $(this).val()
    if (name.length < 5 || name.includes('  ') || name.charAt(0) == ' ') {
        $("#error-adprod").text("Product name should be more than 5 characters");
        product_name = false;
    } else {
        product_name = true;
        $("#error-adprod").text(" ");

    }
})
$('#product_des').blur(function () {
    var password = $(this).val()
    if (password.length < 10) {
        $("#error-addes").text("Min 10 characters needed");
        product_des = false;
    } else {
        product_des = true;
        $("#error-addes").text(" ");
    }
})
$('#product_price').on('input', function () {
    this.value = this.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');
    var price = $(this).val()
    if (price.length < 1) {
        $("#error-adprice").text("Min 1 input needed");
        product_price = false;
    } else {
        product_price = true;
        $("#error-adprice").text(" ");
    }
})
$('#product_qty').on('input', function () {
    this.value = this.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');
    var password = $(this).val()
    if (password.length < 1) {
        $("#error-adqty").text("Min 1 input needed");
        product_qty = false;
    } else {
        product_qty = true;
        $("#error-adqty").text(" ");
    }
})
$('#addproduct').on("submit", (e) => {
    e.preventDefault()
    console.log(product_name)
    console.log(product_des)
    console.log(product_price)
    console.log(product_qty)

    if (product_name == true && product_des == true && product_price == true && product_qty == true && Img1 == true && Img2 == true && Img3 == true && Img4 == true && Img5 == true) {
        let data = $("#addproduct")[0];
        let formData = new FormData(data);
        formData.append('data', data);
        formData.append('img1', img1)
        formData.append('img2', img2)
        formData.append('img3', img3)
        formData.append('img4', img4)
        formData.append('img5', img5)
        // console.log(img2);
        // console.log(formData)
        $.ajax({
            url: "/admin/add-product",
            data: formData,
            method: "post",
            enctype: 'multipart/formdata',
            processData: false,
            contentType: false,
            success: function (response) {
                // alert("Form submitted successfully")
                if (response.status == true) {
                    location.reload()
                } else {
                    $("#submit-pmessage").html("fill the fields");
                }

            },
            error: function (err) {
                // alert("Something Error")
            }
        })
    } else {
        $("#submit-pmessage").html("Fill the Fields");
    }

})

document.getElementById('maincat').onchange = e => {
    console.log(e.target.value)
    let detail = e.target.value
    $.ajax({
        url: "/admin/getSubcategory",
        method: "POST",
        data: { detail },
        success: function (response) {
            console.log(response.category.subcategory[0])
            document.getElementById('subcategory').innerHTML = '';
            document.getElementById('subtype').innerHTML = '';
            // console.log(response.category.type[0])
            for (let i = 0; i < response.category.subcategory.length; i++) {
                let element = `<option value= "${response.category.subcategory[i].name}" > ${response.category.subcategory[i].name} </option>`
                let typeelement = `<option value= "${response.category.type[i].name}" > ${response.category.type[i].name} </option>`
                document.getElementById('subcategory').innerHTML += element
                document.getElementById('subtype').innerHTML += typeelement
            }

        }
    })

}

function applycoupon() {

    let code = document.getElementById('couponid').value
    // console.log(code)
    $.ajax({
        url: '/checkout/applycoupon',
        data: { code },
        method: 'post',
        success: (response) => {
            console.log(response);
            if (response.couponPrice) {
                newcoupon = code
                // location.reload()
                document.getElementById('couponul').innerHTML += ` <li><span>Discount Price</span><span id=""> ₹ ${response.couponPrice}</span>`
                document.getElementById('applybtn').disabled = true
                // alert(response.disPrice)
                document.getElementById('couponsuccess').innerHTML = response.message
                document.getElementById('couponinvalid').innerHTML = " "

            } else if (response.vmessage == true) {
                document.getElementById('couponinvalid').innerHTML = " "
                document.getElementById('couponinval').innerHTML = response.message

            } else if (response.imessage == true) {
                document.getElementById('couponinval').innerHTML = " "
                document.getElementById('couponinvalid').innerHTML = response.invalidmessage

            } else if (response.umessage == true) {
                console.log("kerii");
                document.getElementById('couponinvalid').innerHTML = response.uerrmessage
            }

        }
    })
}

//delete coupon
function deleteCoupon(copId) {
    //     Swal.fire({
    //         title: "Delete this product ?",
    //         icon: 'question',
    //         showCancelButton: true,
    //         confirmButtonColor: '#d33',
    //         cancelButtonColor: '#3085d6',
    //         confirmButtonText: 'Delete'
    //     }).then((result) => {
    //         if (result.isConfirmed) {
    $.ajax({
        url: '/admin/coupons/delete-coupon',
        data: {
            copId,
        },
        method: 'post',
        success: (response) => {
            if (response) {
                location.reload()
            } else {

            }
        },
    })
    //     } else {

    //     }
    // });
}
function addtowishlist(proId) {
    $.ajax({
        url: '/add-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {
            // console.log(response)
            if (response.status == true) {
                // location.reload()
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: false,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: 'success',
                    title: 'Added to Wishlist'
                }).then((res) => {
                    // location.reload()
                })

            } else if (response.alreadyexist == true) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: false,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer)
                        toast.addEventListener('mouseleave', Swal.resumeTimer)
                    }
                })

                Toast.fire({
                    icon: '',
                    title: 'Already in your wishlist'
                }).then((res) => {
                    // location.reload()
                })
            }
            else {
                location.href = "/user-signin"
            }

        }
    })
}

function removewishlist(wishId, proId) {
    // console.log(cartId, proId)
    Swal.fire({
        title: 'Remove from wishlist?',
        text: "",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Remove'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: '/delete-wish-item',
                data: {
                    wishlist: wishId,
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

function moveTobag(wishId, proId) {
    $.ajax({
        url: '/move-to-wishlist/' + proId,
        method: 'get',
        success: (response) => {
            // console.log(response)
            if (response.status) {

                $.ajax({
                    url: '/delete-wish-item',
                    method: 'post',
                    data: {
                        wishlist: wishId,
                        product: proId,
                    },

                    success: (response) => {
                        if (response) {
                            // alert("Deleted")
                            window.location.reload()
                        } else {

                        }
                    },
                })

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


function buynowapplycoupon(proId) {
    let code = document.getElementById('couponid').value

    $.ajax({
        url: '/buy-checkout/buy-apply-coupon/' + proId,
        method: 'post',
        data: { code },
        success: (response) => {

            if (response.couponPrice) {
                console.log(response);
                newcoupon = code
                // location.reload()
                document.getElementById('couponull').innerHTML += ` <li><span>Discount Price</span><span id=""> ₹ ${response.couponPrice}</span>`
                document.getElementById('applybtnn').disabled = true
                // alert(response.disPrice)
                document.getElementById('couponsuccesss').innerHTML = response.bmessage
                document.getElementById('couponinvalidd').innerHTML = " "
            } else if (response.bvmessage == true) {
                document.getElementById('couponinvalidd').innerHTML = " "
                document.getElementById('couponinvall').innerHTML = response.message

            } else if (response.bimessage == true) {
                document.getElementById('couponinvall').innerHTML = " "
                document.getElementById('couponinvalidd').innerHTML = response.invalidmessage

            } else if (response.bumessage == true) {
                console.log("kerii");
                document.getElementById('couponinvalidd').innerHTML = response.uerrmessage
            }

        }
    })
}


function changestatus(cartId, userId) {
    let stat = document.getElementById('status').value
    console.log(cartId, userId, stat)
    $.ajax({
        url: '/admin/changestatus',
        data: {
            cart: cartId,
            user: userId,
            status: stat
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                // alert("Deleted")
                location.reload()
            } else {

            }
        }
    })
}











