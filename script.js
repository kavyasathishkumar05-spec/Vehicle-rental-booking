"use strict";

// Vehicle Details
const vehicles = [
    { id: 1, name: "Toyota Innova Crysta", type: "suv", price: 2200, seats: 7, img: "https://pngimg.com/d/toyota_PNG1920.png" },
    { id: 2, name: "Royal Enfield Classic 350", type: "bike", price: 750, seats: 2, img: "https://pngimg.com/d/motorcycle_PNG3154.png" },
    { id: 3, name: "Honda City", type: "car", price: 1500, seats: 5, img: "https://pngimg.com/d/car_PNG1638.png" },
    { id: 4, name: "Yamaha MT-15", type: "bike", price: 750, seats: 2, img: "https://pngimg.com/d/motorcycle_PNG3156.png" },
    { id: 5, name: "Hyundai Creta", type: "suv", price: 1900, seats: 5, img: "https://pngimg.com/d/car_PNG1641.png" },
    { id: 6, name: "Honda CB200X", type: "bike", price: 850, seats: 2, img: "https://pngimg.com/d/motorcycle_PNG3160.png" },
    { id: 7, name: "Maruti Swift", type: "car", price: 1200, seats: 5, img: "https://pngimg.com/d/car_PNG1640.png" },
    { id: 8, name: "Mahindra Thar", type: "suv", price: 2500, seats: 4, img: "https://pngimg.com/d/car_PNG1636.png" }
];

// Application State
let selected = null;
let bookings = [];

try {
    bookings = JSON.parse(
        localStorage.getItem("driveease_bookings") || "[]"
    );

    if (!Array.isArray(bookings)) {
        bookings = [];
    }
} catch (error) {
    bookings = [];
}

// HTML Elements
const getEl = (id) => document.getElementById(id);

const listEl = getEl("vehicleList");
const fromDate = getEl("fromDate");
const toDate = getEl("toDate");
const userName = getEl("userName");
const userPhone = getEl("userPhone");
const totalDays = getEl("totalDays");
const totalAmount = getEl("totalAmount");
const payAmount = getEl("payAmount");
const payDetails = getEl("payDetails");
const payMethod = getEl("payMethod");

// Save Bookings
function saveBookings() {
    try {
        localStorage.setItem(
            "driveease_bookings",
            JSON.stringify(bookings)
        );
    } catch (error) {
        alert("Unable to save bookings in this browser.");
    }
}

// Render Vehicles
function render(vehicleList = vehicles) {
    if (!listEl) return;

    listEl.innerHTML = vehicleList.map(vehicle => `
        <div class="card">
            <img
                src="${vehicle.img}"
                alt="${vehicle.name}"
                onerror="this.onerror=null;this.src='https://placehold.co/300x180?text=Vehicle';"
            >

            <div class="card-body">
                <h4>${vehicle.name}</h4>

                <div class="meta">
                    ${vehicle.type.toUpperCase()}
                    • ${vehicle.seats} Seater
                    • Available
                </div>

                <div class="price-row">
                    <span class="price">
                        ₹${vehicle.price.toLocaleString("en-IN")}/day
                    </span>

                    <button onclick="openBook(${vehicle.id})">
                        Book Now →
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    updateStats();
}

// Vehicle Filters
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const type = button.dataset.type;

        if (type === "all") {
            render(vehicles);
        } else {
            render(vehicles.filter(vehicle => vehicle.type === type));
        }
    });
});

// Open Booking Modal
function openBook(id) {
    selected = vehicles.find(vehicle => vehicle.id === id);

    if (!selected) return;

    getEl("modalVehicleName").textContent = selected.name;
    getEl("modalPrice").textContent = selected.price;
    totalDays.textContent = "1";
    totalAmount.textContent = selected.price;

    if (fromDate) fromDate.value = "";
    if (toDate) toDate.value = "";

    getEl("bookModal").style.display = "flex";
}

// Close Modal
function closeModal(id) {
    const modal = getEl(id);
    if (modal) modal.style.display = "none";
}

// Calculate Rental Days and Amount
function calcDays() {
    if (!selected || !fromDate.value || !toDate.value) return;

    const start = new Date(fromDate.value + "T00:00:00");
    const end = new Date(toDate.value + "T00:00:00");

    if (Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())) {
        return;
    }

    if (end < start) {
        totalDays.textContent = "0";
        totalAmount.textContent = "0";
        return;
    }

    const days = Math.round(
        (end.getTime() - start.getTime()) / 86400000
    ) + 1;

    totalDays.textContent = days;
    totalAmount.textContent = days * selected.price;
}

if (fromDate) {
    fromDate.addEventListener("change", calcDays);
}

if (toDate) {
    toDate.addEventListener("change", calcDays);
}

// Proceed to Payment
function proceedToPay() {
    if (!selected) {
        alert("Please select a vehicle.");
        return;
    }

    if (
        !fromDate.value ||
        !toDate.value ||
        !userName.value.trim() ||
        !userPhone.value.trim()
    ) {
        alert("Please fill all fields.");
        return;
    }

    const start = new Date(fromDate.value + "T00:00:00");
    const end = new Date(toDate.value + "T00:00:00");

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end < start
    ) {
        alert("Please select valid rental dates.");
        return;
    }

    if (new Date(fromDate.value + "T00:00:00") <
        new Date(new Date().toDateString())) {
        alert("The start date cannot be in the past.");
        return;
    }

    const phone = userPhone.value.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
        alert("Enter a valid 10-digit Indian mobile number.");
        return;
    }

    calcDays();

    if (Number(totalAmount.textContent) <= 0) {
        alert("Please select valid rental dates.");
        return;
    }

    payAmount.textContent = totalAmount.textContent;

    closeModal("bookModal");
    getEl("payModal").style.display = "flex";
}

// Confirm Booking
function confirmBooking() {
    if (!selected) {
        alert("Please select a vehicle.");
        return;
    }

    if (!payMethod.value) {
        alert("Please select a payment method.");
        return;
    }

    if (
        payMethod.value !== "COD" &&
        !payDetails.value.trim()
    ) {
        alert("Please enter the required payment details.");
        return;
    }

    const booking = {
        id: Date.now(),
        vehicle: selected.name,
        type: selected.type,
        from: fromDate.value,
        to: toDate.value,
        days: Number(totalDays.textContent),
        amount: Number(totalAmount.textContent),
        user: userName.value.trim(),
        phone: userPhone.value.trim(),
        method: payMethod.value,
        status: payMethod.value === "COD"
            ? "Booking Confirmed - Pay Later"
            : "Demo Payment Confirmed",
        date: new Date().toLocaleString("en-IN")
    };

    bookings.unshift(booking);
    saveBookings();

    closeModal("payModal");

    alert(
        `Booking Confirmed!\n` +
        `${booking.vehicle}\n` +
        `Duration: ${booking.days} day(s)\n` +
        `Amount: ₹${booking.amount}`
    );

    selected = null;
    updateStats();
}

// Display Bookings
function showBookings() {
    const box = getEl("myBookingsList");

    if (!box) return;

    if (bookings.length === 0) {
        box.innerHTML = "<p>No bookings yet.</p>";
    } else {
        box.innerHTML = bookings.map(booking => `
            <div class="booking-item"
                 style="border:1px solid #ddd;padding:12px;
                 border-radius:10px;margin-bottom:10px">

                <b>${escapeHTML(booking.vehicle)}</b>
                (${escapeHTML(booking.type)})
                - ₹${Number(booking.amount).toLocaleString("en-IN")}

                <br>

                <small>
                    ${escapeHTML(booking.from)} to
                    ${escapeHTML(booking.to)}
                    • ${Number(booking.days)} day(s)
                    • ${escapeHTML(booking.method)}
                    <br>
                    ${escapeHTML(booking.status)}
                    <br>
                    User: ${escapeHTML(booking.user)}
                    | ${escapeHTML(booking.phone)}
                    <br>
                    ${escapeHTML(booking.date)}
                </small>

                <br>

                <button
                    onclick="cancelB(${Number(booking.id)})"
                    style="margin-top:6px;background:#fee2e2;
                    border:none;padding:6px 10px;border-radius:6px;
                    cursor:pointer">
                    Cancel Booking
                </button>
            </div>
        `).join("");
    }

    getEl("myModal").style.display = "flex";
}

// Prevent HTML Injection in Booking Details
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Cancel Booking
function cancelB(id) {
    const booking = bookings.find(item => item.id === id);

    if (!booking) return;

    if (!confirm("Are you sure you want to cancel this booking?")) {
        return;
    }

    bookings = bookings.filter(item => item.id !== id);
    saveBookings();

    showBookings();
    updateStats();

    alert(
        "Booking cancelled. Any actual payment refund must be processed through the payment provider."
    );
}

// Update Dashboard Statistics
function updateStats() {
    const countEl = getEl("totalCount");
    const revenueEl = getEl("rev");
    const activeEl = getEl("active");

    const count = bookings.length;

    // Demo total: sum of stored booking amounts.
    const revenue = bookings.reduce(
        (sum, booking) => sum + Number(booking.amount || 0),
        0
    );

    if (countEl) countEl.textContent = count;

    if (revenueEl) {
        revenueEl.textContent = "₹" +
            revenue.toLocaleString("en-IN");
    }

    if (activeEl) activeEl.textContent = count;
}

// Close Modal by Clicking Outside
window.addEventListener("click", event => {
    if (event.target.classList.contains("modal")) {
        event.target.style.display = "none";
    }
});

// Initialize Application
render();

// Make Functions Available to HTML onclick Attributes
window.openBook = openBook;
window.closeModal = closeModal;
window.proceedToPay = proceedToPay;
window.confirmBooking = confirmBooking;
window.showBookings = showBookings;
window.cancelB = cancelB;