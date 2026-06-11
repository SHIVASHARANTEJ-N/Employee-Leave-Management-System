// Tab Navigation
function initTabNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}
// Leave Application Form
function initLeaveForm() {
    const form = document.getElementById('leaveForm');
    const leaveTypeSelect = document.getElementById('leaveType');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const workingDaysSpan = document.getElementById('workingDays');
    const selectedLeaveTypeSpan = document.getElementById('selectedLeaveType');
    const leaveDurationSpan = document.getElementById('leaveDuration');
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;
    // Update end date minimum when start date changes
    startDateInput.addEventListener('change', () => {
        endDateInput.min = startDateInput.value;
        if (endDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = startDateInput.value;
        }
        updateSummary();
    });

    endDateInput.addEventListener('change', updateSummary);
    leaveTypeSelect.addEventListener('change', updateSummary);

    function updateSummary() {
        // Update leave type
        const selectedOption = leaveTypeSelect.options[leaveTypeSelect.selectedIndex];
        if (selectedOption.value) {
            selectedLeaveTypeSpan.textContent = selectedOption.text.split(' - ')[0];
        } else {
            selectedLeaveTypeSpan.textContent = '-';
        }

        // Calculate working days and duration
        if (startDateInput.value && endDateInput.value) {
            const startDate = new Date(startDateInput.value);
            const endDate = new Date(endDateInput.value);
            
            // Calculate working days (excluding weekends)
            let workingDays = 0;
            const currentDate = new Date(startDate);
            
            while (currentDate <= endDate) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
                    workingDays++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            workingDaysSpan.textContent = `${workingDays} days`;
            
            // Format duration
            const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            leaveDurationSpan.textContent = `${startFormatted} - ${endFormatted}`;
        } else {
            workingDaysSpan.textContent = '0 days';
            leaveDurationSpan.textContent = '-';
        }
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate form
        const formData = new FormData(form);
        const leaveType = document.getElementById('leaveType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const reason = document.getElementById('reason').value;
        
        if (!leaveType || !startDate || !endDate || !reason.trim()) {
            showToast('Missing Information', 'Please fill in all required fields.', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            showToast('Invalid Date Range', 'End date must be after start date.', 'error');
            return;
        }
        
        // Success
        const leaveTypeName = leaveTypeSelect.options[leaveTypeSelect.selectedIndex].text.split(' - ')[0];
        showToast('Leave Application Submitted', `Your ${leaveTypeName} application has been submitted for approval.`, 'success');
        
        // Reset form
        form.reset();
        updateSummary();
        
        // Add to history (in a real app, this would be sent to a server)
        addToHistory({
            type: leaveTypeName,
            startDate: new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            endDate: new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            days: document.getElementById('workingDays').textContent.replace(' days', ''),
            status: 'pending',
            appliedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
    });
}

// Leave History
function initLeaveHistory() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    searchInput.addEventListener('input', filterHistory);
    statusFilter.addEventListener('change', filterHistory);
    
    function filterHistory() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const rows = document.querySelectorAll('#historyTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const status = row.querySelector('.status').textContent.toLowerCase();
            
            const matchesSearch = text.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || status.includes(statusFilter);
            
            row.style.display = matchesSearch && matchesStatus ? '' : 'none';
        });
    }
}

function addToHistory(leave) {
    const tbody = document.getElementById('historyTableBody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>${leave.type}</td>
        <td>${leave.startDate}</td>
        <td>${leave.endDate}</td>
        <td>${leave.days}</td>
        <td><span class="status ${leave.status}">${leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span></td>
        <td>${leave.appliedOn}</td>
        <td>
            <button class="action-btn view">
                <i class="fas fa-eye"></i>
            </button>
            ${leave.status === 'pending' ? `
                <button class="action-btn edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn cancel">
                    <i class="fas fa-times"></i>
                </button>
            ` : ''}
        </td>
    `;
    
    tbody.insertBefore(row, tbody.firstChild);
}

// Profile Form
function initProfileForm() {
    const profileForm = document.querySelector('.profile-form');
    
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Profile Updated', 'Your profile information has been successfully updated.', 'success');
    });
}

// Animated Counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current);
        }, 16);
    });
}

// Progress Bar Animation
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.balance-fill, .progress-fill');
    
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTabNavigation();
    initLeaveForm();
    initLeaveHistory();
    initProfileForm();
    
    // Animate elements on first load
    setTimeout(() => {
        animateCounters();
        animateProgressBars();
    }, 300);
});

// Add some sample interactions for demonstration
document.addEventListener('click', (e) => {
    if (e.target.closest('.action-btn.view')) {
        showToast('View Details', 'Leave request details would be displayed here.', 'success');
    }
    
    if (e.target.closest('.action-btn.edit')) {
        showToast('Edit Request', 'Edit functionality would be available here.', 'success');
    }
    
    if (e.target.closest('.action-btn.cancel')) {
        if (confirm('Are you sure you want to cancel this leave request?')) {
            showToast('Request Cancelled', 'Your leave request has been cancelled.', 'success');
            e.target.closest('tr').remove();
        }
    }
    
    if (e.target.closest('.change-photo-btn')) {
        showToast('Photo Upload', 'Photo upload functionality would be implemented here.', 'success');
    }
});

// Add smooth scrolling for any anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});