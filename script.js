const activeAdmin = sessionStorage.getItem("medicare_session");

if (!activeAdmin) {
    window.location.replace("index.html");
}
const configs = {
    patients: {
        title: "Patients",
        fields: [
            ["name", "Patient Name", "text"],
            ["age", "Age", "number"],
            ["gender", "Gender", "select", ["Male", "Female", "Other"]],
            ["phone", "Phone Number", "tel"],
            ["disease", "Disease", "text"],
            ["date", "Registration Date", "date"]
        ]
    },
    doctors: {
        title: "Doctors",
        fields: [
            ["name", "Doctor Name", "text"],
            ["specialization", "Specialization", "text"],
            ["phone", "Phone Number", "tel"],
            ["email", "Email", "email"],
            ["experience", "Experience (Years)", "number"]
        ]
    },
    appointments: {
        title: "Appointments",
        fields: [
            ["patient", "Patient Name", "text"],
            ["doctor", "Doctor Name", "text"],
            ["date", "Appointment Date", "date"],
            ["time", "Appointment Time", "time"],
            ["reason", "Reason", "text"],
            ["status", "Status", "select", ["Scheduled", "Completed", "Cancelled"]]
        ]
    },
    billing: {
        title: "Billing",
        fields: [
            ["patient", "Patient Name", "text"],
            ["amount", "Amount (₹)", "number"],
            ["date", "Bill Date", "date"],
            ["payment", "Payment Method", "select", ["Cash", "UPI", "Card"]],
            ["status", "Payment Status", "select", ["Paid", "Pending"]]
        ]
    },
    medicines: {
        title: "Medicines",
        fields: [
            ["name", "Medicine Name", "text"],
            ["quantity", "Quantity", "number"],
            ["price", "Price (₹)", "number"],
            ["expiry", "Expiry Date", "date"]
        ]
    },
    staff: {
        title: "Staff",
        fields: [
            ["name", "Staff Name", "text"],
            ["role", "Job Role", "text"],
            ["phone", "Phone Number", "tel"],
            ["salary", "Salary (₹)", "number"]
        ]
    }
};

let currentPage = "dashboard";
let currentEditId = null;
let currentRecords = [];

// Local Storage
function getData(key) {
    return JSON.parse(localStorage.getItem("medicare_" + key) || "[]");
}

function saveData(key, data) {
    localStorage.setItem("medicare_" + key, JSON.stringify(data));
}

// Date
document.getElementById("today-date").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
    });

// Navigation
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item =>
            item.classList.remove("active")
        );

        link.classList.add("active");
        showPage(link.dataset.page);
    });
});

// Render page
function showPage(page) {
    currentPage = page;

    const titles = {
        dashboard: "Dashboard",
        reports: "Reports"
    };

    document.getElementById("page-title").textContent =
        titles[page] || configs[page].title;

    if (page === "dashboard") {
        renderDashboard();
    } else if (page === "reports") {
        renderReports();
    } else {
        renderTable(page);
    }

    if (window.lucide) lucide.createIcons();
}

// Dashboard
function renderDashboard() {
    const patients = getData("patients");
    const doctors = getData("doctors");
    const appointments = getData("appointments");
    const billing = getData("billing");

    document.getElementById("page-content").innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <p>Total Patients</p>
                <h2>${patients.length}</h2>
                <span>Registered patients</span>
            </div>
            <div class="stat-card">
                <p>Total Doctors</p>
                <h2>${doctors.length}</h2>
                <span>Available doctors</span>
            </div>
            <div class="stat-card">
                <p>Appointments</p>
                <h2>${appointments.length}</h2>
                <span>All appointments</span>
            </div>
            <div class="stat-card">
                <p>Total Revenue</p>
                <h2>₹${billing.filter(b => b.status === "Paid")
                    .reduce((sum, b) => sum + Number(b.amount || 0), 0)
                    .toLocaleString("en-IN")}</h2>
                <span>Paid bills</span>
            </div>
        </div>

        <div class="panel">
            <h3 class="section-title">Recent Patients</h3>
            ${patients.length ? `
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Disease</th></tr>
                    </thead>
                    <tbody>
                        ${patients.slice(-5).reverse().map(p => `
                            <tr>
                                <td>${escapeHTML(p.name)}</td>
                                <td>${escapeHTML(p.age)}</td>
                                <td>${escapeHTML(p.gender)}</td>
                                <td>${escapeHTML(p.phone)}</td>
                                <td>${escapeHTML(p.disease)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>` : `<p class="empty">No patients registered yet. Add your first patient.</p>`}
        </div>

        <div class="panel">
            <h3 class="section-title">Appointment Overview</h3>
            <p>Scheduled: ${appointments.filter(a => a.status === "Scheduled").length}</p>
            <p>Completed: ${appointments.filter(a => a.status === "Completed").length}</p>
            <p>Cancelled: ${appointments.filter(a => a.status === "Cancelled").length}</p>
        </div>
    `;
}

// Table rendering
function renderTable(key, search = "") {
    const config = configs[key];
    let records = getData(key);

    const term = search.toLowerCase();

    records = records.filter(record =>
        Object.values(record).some(value =>
            String(value).toLowerCase().includes(term)
        )
    );

    currentRecords = records;

    const headers = config.fields.map(field =>
        `<th>${escapeHTML(field[1])}</th>`
    ).join("");

    const rows = records.map(record => `
        <tr>
            ${config.fields.map(field => {
                const value = record[field[0]] ?? "";
                return `<td>${escapeHTML(value)}</td>`;
            }).join("")}
            <td>
                <button class="action-btn" onclick="editRecord('${key}', '${record.id}')">Edit</button>
                <button class="action-btn delete-btn" onclick="deleteRecord('${key}', '${record.id}')">Delete</button>
            </td>
        </tr>
    `).join("");

    document.getElementById("page-content").innerHTML = `
        <div class="page-toolbar">
            <input class="search-input" id="search-record"
                placeholder="Search records..." value="${escapeHTML(search)}">
            <button class="btn-primary" onclick="openModal('${key}')">
                + Add ${config.title}
            </button>
        </div>

        <div class="panel">
            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>${headers}<th>Actions</th></tr>
                    </thead>
                    <tbody>
                        ${rows || `<tr><td colspan="${config.fields.length + 1}" class="empty">No records found.</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById("search-record").addEventListener("input", e => {
        renderTable(key, e.target.value);
        const input = document.getElementById("search-record");
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    });
}

// Add record modal
function openModal(key) {
    currentEditId = null;
    const config = configs[key];

    document.getElementById("modal-title").textContent =
        "Add " + config.title;

    document.getElementById("form-fields").innerHTML =
        config.fields.map(field => {
            const [name, label, type, options] = field;

            let control;

            if (type === "select") {
                control = `
                    <select class="form-control" name="${name}" required>
                        <option value="">Select ${label}</option>
                        ${options.map(option =>
                            `<option value="${option}">${option}</option>`
                        ).join("")}
                    </select>`;
            } else {
                control = `
                    <input class="form-control" type="${type}"
                    name="${name}" ${type === "number" ? 'min="0"' : ""}
                    required>`;
            }

            return `
                <div class="form-field">
                    <label>${label}</label>
                    ${control}
                </div>`;
        }).join("");

    document.getElementById("record-form").dataset.key = key;
    document.getElementById("record-modal").classList.add("show");
}


// Edit record
function editRecord(key, id) {
    const record = getData(key).find(item => item.id === id);
    if (!record) return;

    // Open modal first
    openModal(key);

    // Set edit ID after opening modal
    currentEditId = id;

    document.getElementById("modal-title").textContent =
        "Edit " + configs[key].title;

    const form = document.getElementById("record-form");

    configs[key].fields.forEach(field => {
        form.elements[field[0]].value = record[field[0]] ?? "";
    });
}


// Save form
document.getElementById("record-form").addEventListener("submit", e => {
    e.preventDefault();

    const form = e.target;
    const key = form.dataset.key;
    const data = getData(key);

    const record = {
        id: currentEditId || Date.now().toString(),
        ...Object.fromEntries(
            configs[key].fields.map(field => [
                field[0], form.elements[field[0]].value.trim()
            ])
        )
    };

    if (currentEditId) {
        const index = data.findIndex(item => item.id === currentEditId);
        if (index !== -1) data[index] = record;
    } else {
        data.push(record);
    }

    saveData(key, data);
    closeModal();
    showPage(key);
});

// Delete record
function deleteRecord(key, id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const data = getData(key).filter(item => item.id !== id);
    saveData(key, data);
    showPage(key);
}

// Close modal
function closeModal() {
    document.getElementById("record-modal").classList.remove("show");
    document.getElementById("record-form").reset();
    currentEditId = null;
}

// Escape HTML to display user input safely
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Reports
function renderReports() {
    const patients = getData("patients");
    const appointments = getData("appointments");
    const bills = getData("billing");

    const revenue = bills.filter(b => b.status === "Paid")
        .reduce((sum, b) => sum + Number(b.amount || 0), 0);

    document.getElementById("page-content").innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <p>Total Patients</p><h2>${patients.length}</h2>
            </div>
            <div class="stat-card">
                <p>Total Appointments</p><h2>${appointments.length}</h2>
            </div>
            <div class="stat-card">
                <p>Paid Bills</p>
                <h2>${bills.filter(b => b.status === "Paid").length}</h2>
            </div>
            <div class="stat-card">
                <p>Total Revenue</p><h2>₹${revenue.toLocaleString("en-IN")}</h2>
            </div>
        </div>
        <div class="panel">
            <h3 class="section-title">Hospital Summary</h3>
            <p>Registered patients: ${patients.length}</p>
            <p>Appointments: ${appointments.length}</p>
            <p>Pending bills: ${bills.filter(b => b.status === "Pending").length}</p>
            <p>Medicine records: ${getData("medicines").length}</p>
            <p>Staff members: ${getData("staff").length}</p>
         </div>
    `;
}
    


const loggedAdmin = JSON.parse(
    sessionStorage.getItem("medicare_session") || "null"
);

// Display admin name

// Display admin name
if (loggedAdmin) {
    const adminName = document.getElementById("admin-name");
    const avatar = document.getElementById("admin-avatar");
    const topAvatar = document.getElementById("top-admin-avatar");

    if (adminName) {
        adminName.textContent = loggedAdmin.name;
    }

    if (avatar) {
        avatar.textContent = loggedAdmin.name.charAt(0).toUpperCase();
    }

    if (topAvatar) {
        topAvatar.textContent = loggedAdmin.name.charAt(0).toUpperCase();
    }
}


// Logout function
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        sessionStorage.removeItem("medicare_session");
        window.location.replace("index.html");
    }
}

// Initial page
showPage("dashboard")
