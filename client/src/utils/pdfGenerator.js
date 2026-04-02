import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateBookingReceipt = (booking) => {
    const doc = new jsPDF();
    const { _id, user, service, checkIn, checkOut, guests, totalPrice, paymentStatus, paymentTransactionId } = booking;

    // --- Header ---
    doc.setFillColor(99, 102, 241); // Primary color
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('BookKZ - Receipt', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString();
    doc.text(`Issued on: ${date}`, 160, 25);

    // --- Info Section ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Reference:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`BKZ-${_id.slice(-8).toUpperCase()}`, 70, 55);

    doc.setFont('helvetica', 'bold');
    doc.text('Customer:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.name || 'Guest', 70, 65);

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.email || 'N/A', 70, 75);

    // --- Table ---
    autoTable(doc, {
        startY: 90,
        head: [['Service', 'Dates', 'Guests', 'Amount']],
        body: [
            [
                service?.title || 'Unknown Service',
                `${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}`,
                guests,
                `${totalPrice.toLocaleString()} KZT`
            ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10, cellPadding: 5 }
    });

    // --- Summary Section ---
    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 130) + 15;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status:', 120, finalY);
    
    doc.setTextColor(paymentStatus === 'paid' ? [16, 185, 129] : [239, 68, 68]);
    doc.text(paymentStatus?.toUpperCase() || 'UNPAID', 165, finalY);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('TOTAL PRICE:', 120, finalY + 15);
    doc.text(`${totalPrice.toLocaleString()} KZT`, 165, finalY + 15);

    // --- Transaction Info ---
    if (paymentTransactionId) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Transaction ID: ${paymentTransactionId}`, 20, 280);
    }

    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Thank you for choosing BookKZ! If you have any questions, please contact our support.', 20, 290);

    // Save PDF
    doc.save(`receipt-${_id.slice(-8)}.pdf`);
};
