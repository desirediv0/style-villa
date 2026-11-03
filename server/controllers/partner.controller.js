;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponsive } from '../utils/ApiResponsive.js';
import { prisma } from '../config/db.js';


// Register as partner (public)
export const registerPartner = asyncHandler(async (req, res) => {
    const { name, email, number, city, state, message } = req.body;
    if (!name || !email || !number || !city || !state || !message) {
        return res.status(400).json(new ApiResponsive(400, null, 'All fields are required'));
    }
    const emailNorm = String(email).trim().toLowerCase();
    // Check if already requested
    const exists = await prisma.partnerRequest.findFirst({
        where: { email: { equals: emailNorm, mode: 'insensitive' } }
    });
    if (exists) {
        return res.status(409).json(new ApiResponsive(409, null, 'Request already submitted'));
    }
    const request = await prisma.partnerRequest.create({
        data: { name, email: emailNorm, number, city, state, message },
    });
    res.status(201).json(new ApiResponsive(201, { request }, 'Request submitted'));
});

// Partner login (only if approved)
export const partnerLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json(new ApiResponsive(400, null, 'Email and password required'));
    }
    const emailNorm = String(email).trim().toLowerCase();
    const partner = await prisma.partner.findFirst({
        where: { email: { equals: emailNorm, mode: 'insensitive' } }
    });
    if (!partner || !partner.isActive) {
        return res.status(401).json(new ApiResponsive(401, null, 'Invalid credentials'));
    }
    const match = await bcrypt.compare(password, partner.password);
    if (!match) {
        return res.status(401).json(new ApiResponsive(401, null, 'Invalid credentials'));
    }
    // Generate JWT
    const token = jwt.sign({ id: partner.id, email: partner.email, role: 'partner' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json(new ApiResponsive(200, { token, partner: { id: partner.id, name: partner.name, email: partner.email } }, 'Login successful'));
});

// Get partner profile (protected)
export const getPartnerProfile = asyncHandler(async (req, res) => {
    const partner = await prisma.partner.findUnique({
        where: { id: req.partner.id },
        select: {
            id: true,
            name: true,
            email: true,
            number: true,
            city: true,
            state: true,
            commissionRate: true,
            isActive: true,
            createdAt: true
        }
    });

    res.status(200).json(new ApiResponsive(200, { partner }, 'Profile fetched successfully'));
});

// Get partner dashboard stats (protected)
// Uses PartnerEarning rows (created when order is DELIVERED with coupon) so amounts match admin commission logic.
export const getPartnerDashboard = asyncHandler(async (req, res) => {
    const partnerId = req.partner.id;

    const totalCoupons = await prisma.couponPartner.count({
        where: { partnerId }
    });

    const earningsRows = await prisma.partnerEarning.findMany({
        where: {
            partnerId,
            order: { status: 'DELIVERED' }
        },
        include: {
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    total: true,
                    subTotal: true,
                    discount: true,
                    createdAt: true
                }
            },
            coupon: {
                select: { code: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    let totalOrderValue = 0;
    let totalCommissionEarned = 0;
    let totalCommissionRate = 0;

    earningsRows.forEach(e => {
        // Order value = goods value after the coupon discount (what commission is calculated on)
        totalOrderValue += parseFloat(e.order?.subTotal || 0) - parseFloat(e.order?.discount || 0);
        totalCommissionEarned += parseFloat(e.amount);
        totalCommissionRate += e.percentage || 0;
    });

    const averageCommissionRate = earningsRows.length > 0
        ? totalCommissionRate / earningsRows.length
        : 0;

    const recentOrders = earningsRows.slice(0, 3).map(e => ({
        id: e.order.id,
        orderNumber: e.order.orderNumber,
        status: e.order.status,
        total: e.order.total,
        discount: e.order.discount,
        createdAt: e.order.createdAt,
        couponCode: e.coupon?.code,
        commissionEarned: parseFloat(e.amount),
        commissionPercent: e.percentage,
        coupon: {
            couponPartners: [{ commission: e.percentage }]
        }
    }));

    res.status(200).json(new ApiResponsive(200, {
        stats: {
            totalCoupons,
            totalEarnings: parseFloat(totalOrderValue.toFixed(2)),
            estimatedCommission: parseFloat(totalCommissionEarned.toFixed(2)),
            commissionRate: parseFloat(averageCommissionRate.toFixed(2))
        },
        recentOrders
    }, 'Dashboard data fetched successfully'));
});

// Get partner coupons (protected)
// Earnings come from PartnerEarning rows (created when an order is delivered), so every partner screen shows the same figure.
export const getPartnerCoupons = asyncHandler(async (req, res) => {
    const partnerId = req.partner.id;

    const coupons = await prisma.couponPartner.findMany({
        where: { partnerId },
        include: {
            coupon: {
                include: {
                    _count: {
                        select: {
                            orders: {
                                where: {
                                    status: 'DELIVERED' // Only count delivered orders
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const grouped = await prisma.partnerEarning.groupBy({
        by: ['couponId'],
        where: { partnerId, order: { status: 'DELIVERED' } },
        _sum: { amount: true },
        _count: { _all: true }
    });
    const byCoupon = new Map(grouped.map(g => [g.couponId, g]));

    const couponsWithEarnings = coupons.map(couponPartner => {
        const g = byCoupon.get(couponPartner.couponId);
        return {
            ...couponPartner,
            actualEarnings: parseFloat(parseFloat(g?._sum?.amount || 0).toFixed(2)),
            orderCount: g?._count?._all || 0
        };
    });

    res.status(200).json(new ApiResponsive(200, { coupons: couponsWithEarnings }, 'Coupons fetched successfully'));
});

// Get partner earnings (protected)
export const getPartnerEarnings = asyncHandler(async (req, res) => {
    const partnerId = req.partner.id;
    const { period = 'all' } = req.query;

    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();

    switch (period) {
        case 'today':
            dateFilter = {
                createdAt: {
                    gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                }
            };
            break;
        case 'week':
            dateFilter = { createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
            break;
        case 'month':
            dateFilter = { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
            break;
        case 'year':
            dateFilter = { createdAt: { gte: new Date(now.getFullYear(), 0, 1) } };
            break;
        default:
            // 'all' - no date filter
            break;
    }

    // One row per delivered order the partner earned on. The amount is the stored commission.
    const rows = await prisma.partnerEarning.findMany({
        where: { ...dateFilter, partnerId, order: { status: 'DELIVERED' } },
        include: {
            coupon: { select: { code: true } },
            order: {
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    subTotal: true,
                    discount: true,
                    createdAt: true,
                    razorpayPayment: { select: { id: true } },
                    user: { select: { name: true, email: true } },
                    items: { select: { product: { select: { name: true } } } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const earningsData = rows.map(row => {
        const order = row.order;
        const orderAmount = parseFloat(order.subTotal || 0) - parseFloat(order.discount || 0);
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            orderAmount: parseFloat(orderAmount.toFixed(2)),
            commission: row.percentage || 0,
            earningAmount: parseFloat(parseFloat(row.amount).toFixed(2)),
            couponCode: row.coupon?.code,
            productName: order.items.map(i => i.product?.name).filter(Boolean).join(', '),
            customerName: order.user?.name,
            customerEmail: order.user?.email,
            orderStatus: order.status,
            paymentStatus: order.razorpayPayment ? 'paid' : 'pending',
            date: order.createdAt,
            createdAt: order.createdAt
        };
    });

    // Calculate summary statistics
    const totalEarnings = earningsData.reduce((sum, earning) => sum + earning.earningAmount, 0);
    const totalOrders = earningsData.length;
    const averageCommission = totalOrders > 0
        ? earningsData.reduce((sum, earning) => sum + earning.commission, 0) / totalOrders
        : 0;

    // Calculate this month's earnings
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyEarnings = earningsData
        .filter(earning => new Date(earning.date) >= thisMonth)
        .reduce((sum, earning) => sum + earning.earningAmount, 0);

    const summary = {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        monthlyEarnings: parseFloat(monthlyEarnings.toFixed(2)),
        totalOrders,
        averageCommission: parseFloat(averageCommission.toFixed(2)),
        period
    };

    res.status(200).json(new ApiResponsive(200, {
        earnings: earningsData,
        summary
    }, 'Earnings fetched successfully'));
});

// Get partner earnings with enhanced filtering and monthly summary (protected)
export const getPartnerEarningsEnhanced = asyncHandler(async (req, res) => {
    const partnerId = req.partner.id;
    const { year, month, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (year || month || startDate || endDate) {
        dateFilter.createdAt = {};

        if (year) {
            const startYear = new Date(`${year}-01-01`);
            const endYear = new Date(`${parseInt(year) + 1}-01-01`);
            dateFilter.createdAt.gte = startYear;
            dateFilter.createdAt.lt = endYear;
        }

        if (month && year) {
            const startMonth = new Date(`${year}-${month.padStart(2, '0')}-01`);
            const nextMonth = new Date(startMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            dateFilter.createdAt.gte = startMonth;
            dateFilter.createdAt.lt = nextMonth;
        }

        if (startDate) {
            dateFilter.createdAt.gte = new Date(startDate);
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            dateFilter.createdAt.lte = endDateTime;
        }
    }

    // Only earnings tied to DELIVERED orders (same rows admin creates on delivery)
    const earnings = await prisma.partnerEarning.findMany({
        where: {
            partnerId,
            order: { status: 'DELIVERED' },
            ...dateFilter
        },
        include: {
            order: {
                select: {
                    orderNumber: true,
                    total: true,
                    createdAt: true,
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            coupon: {
                select: {
                    code: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const allEarnings = await prisma.partnerEarning.findMany({
        where: {
            partnerId,
            order: { status: 'DELIVERED' }
        },
        include: {
            order: { select: { createdAt: true } }
        }
    });

    // Fetch actual monthly earnings from database
    const dbMonthlyEarnings = await prisma.partnerMonthlyEarning.findMany({
        where: { partnerId },
        orderBy: [
            { year: 'desc' },
            { month: 'desc' }
        ]
    });

    // Group all earnings by month/year for monthly summary (fallback for months not in DB)
    const monthlyEarningsMap = {};
    allEarnings.forEach(earning => {
        const date = new Date(earning.createdAt);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${month}`;

        if (!monthlyEarningsMap[key]) {
            monthlyEarningsMap[key] = {
                year,
                month,
                totalAmount: 0,
                totalOrders: 0,
                paymentStatus: 'PENDING',
                paidAt: null
            };
        }

        monthlyEarningsMap[key].totalAmount += parseFloat(earning.amount);
        monthlyEarningsMap[key].totalOrders += 1;
    });

    // Always aggregate months from actual PartnerEarning rows, then overlay payment status from PartnerMonthlyEarning
    const calculatedMonths = Object.values(monthlyEarningsMap).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });
    const dbMonthlyByKey = new Map(
        dbMonthlyEarnings.map(m => [`${m.year}-${String(m.month).padStart(2, '0')}`, m])
    );
    const monthlyEarnings = calculatedMonths.map(calc => {
        const dbRow = dbMonthlyByKey.get(`${calc.year}-${String(calc.month).padStart(2, '0')}`);
        return {
            year: calc.year,
            month: calc.month,
            totalAmount: calc.totalAmount,
            totalOrders: calc.totalOrders,
            paymentStatus: dbRow?.paymentStatus ?? 'PENDING',
            paidAt: dbRow?.paidAt ?? null
        };
    });

    // Calculate summary with proper paid/pending amounts
    const totalEarnings = allEarnings.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);
    const filteredTotal = earnings.reduce((sum, earning) => sum + parseFloat(earning.amount), 0);

    // Calculate paid amount from monthly earnings
    const paidAmount = monthlyEarnings
        .filter(monthly => monthly.paymentStatus === 'PAID')
        .reduce((sum, monthly) => sum + monthly.totalAmount, 0);

    const pendingAmount = totalEarnings - paidAmount;

    const summary = {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        pendingAmount: parseFloat(pendingAmount.toFixed(2)),
        paidAmount: parseFloat(paidAmount.toFixed(2)),
        totalOrders: allEarnings.length,
        filteredTotal: parseFloat(filteredTotal.toFixed(2)),
        filteredOrders: earnings.length,
        averageCommission: earnings.length > 0
            ? parseFloat((earnings.reduce((sum, e) => sum + e.percentage, 0) / earnings.length).toFixed(2))
            : 0
    };

    res.status(200).json(new ApiResponsive(200, {
        earnings: earnings.map(earning => {
            const date = new Date(earning.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            // Find corresponding monthly earning to get payment status
            const monthlyEarning = monthlyEarnings.find(
                m => m.year === year && m.month === month
            );

            return {
                id: earning.id,
                orderId: earning.order?.orderNumber || earning.orderId,
                productName: earning.productName || 'N/A',
                commission: parseFloat(earning.amount),
                percentage: earning.percentage,
                status: monthlyEarning?.paymentStatus || 'PENDING',
                createdAt: earning.createdAt,
                couponCode: earning.coupon?.code || null,
                orderTotal: earning.order?.total || 0,
                customerName: earning.order?.user?.name || 'N/A'
            };
        }),
        monthlyEarnings: monthlyEarnings.map(monthly => ({
            month: `${monthly.year}-${monthly.month.toString().padStart(2, '0')}`,
            totalEarnings: monthly.totalAmount,
            commissionCount: monthly.totalOrders,
            paymentStatus: monthly.paymentStatus,
            paidAt: monthly.paidAt
        })),
        stats: {
            totalEarnings: summary.totalEarnings,
            thisMonthEarnings: summary.filteredTotal,
            pendingPayments: summary.pendingAmount,
            totalCommissions: summary.totalOrders
        },
        filters: { year, month, startDate, endDate }
    }, 'Enhanced earnings data fetched successfully'));
});

// Partner-specific payment status (for their own months)
export const getPartnerPaymentStatus = asyncHandler(async (req, res) => {
    const partnerId = req.partner.id;
    const { year, month } = req.params;

    const monthlyEarning = await prisma.partnerMonthlyEarning.findUnique({
        where: {
            partnerId_year_month: {
                partnerId,
                year: parseInt(year),
                month: parseInt(month)
            }
        },
        select: {
            id: true,
            totalAmount: true,
            totalOrders: true,
            paymentStatus: true,
            paidAt: true,
            notes: true
        }
    });

    res.status(200).json(new ApiResponsive(200, { monthlyEarning }, 'Payment status fetched'));
});

// Partner confirmations (partners can mark their month as confirmed for admin review)
export const confirmPartnerPayment = asyncHandler(async (req, res) => {
    const partnerId = req.partner.id;
    const { year, month, notes } = req.body;

    const monthlyEarning = await prisma.partnerMonthlyEarning.upsert({
        where: {
            partnerId_year_month: {
                partnerId,
                year: parseInt(year),
                month: parseInt(month)
            }
        },
        update: {
            paymentStatus: 'CONFIRMED',
            paidAt: new Date(),
            notes: notes || ''
        },
        create: {
            partnerId,
            year: parseInt(year),
            month: parseInt(month),
            totalAmount: 0,
            totalOrders: 0,
            paymentStatus: 'CONFIRMED',
            paidAt: new Date(),
            notes: notes || ''
        }
    });

    res.status(200).json(new ApiResponsive(200, monthlyEarning, 'Payment confirmed'));
});
