import Invoice from '../models/Invoice.js';
import Product from '../models/Product.js';

/**
 * @desc    Get dashboard insights and analytics for the user
 * @route   GET /api/insights
 * @access  Private
 */
export const getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get current date boundaries for "this month" and "last month"
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Calculate Revenue (This Month vs Last Month)
    const revenueAggregation = await Invoice.aggregate([
      // Match invoices belonging to the user that are NOT Drafts
      { $match: { userId, status: { $ne: 'Draft' } } },
      {
        $group: {
          _id: {
            // Group by year and month
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: {
            $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, '$totalAmount', 0] }
          },
          totalUnpaid: {
            $sum: { $cond: [{ $ne: ['$status', 'Paid'] }, '$totalAmount', 0] }
          }
        },
      },
    ]);

    // Extract revenue values from aggregation result
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    let grandTotalRevenue = 0;
    let grandTotalPaid = 0;
    let grandTotalUnpaid = 0;

    revenueAggregation.forEach((record) => {
      grandTotalRevenue += record.totalRevenue;
      grandTotalPaid += record.totalPaid || 0;
      grandTotalUnpaid += record.totalUnpaid || 0;
      
      // Check if record matches "this month"
      if (
        record._id.year === startOfThisMonth.getFullYear() &&
        record._id.month === startOfThisMonth.getMonth() + 1
      ) {
        thisMonthRevenue = record.totalRevenue;
      }
      // Check if record matches "last month"
      if (
        record._id.year === startOfLastMonth.getFullYear() &&
        record._id.month === startOfLastMonth.getMonth() + 1
      ) {
        lastMonthRevenue = record.totalRevenue;
      }
    });

    // Calculate Growth Percentage
    let revenueGrowthPercentage = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowthPercentage =
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
      revenueGrowthPercentage = 100; // Infinite growth if last month was 0
    }

    // 2. Identify Top Revenue Client
    const topClientAggregation = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'Draft' } } },
      { $sort: { createdAt: 1 } }, // sort ascending to get latest invoice at the end of the group
      {
        $group: {
          _id: '$clientId', // Group by client (null for walk-in consumers)
          totalGenerated: { $sum: '$totalAmount' },
          latestInvoiceNumber: { $last: '$invoiceNumber' },
          consumerDetails: { $last: '$consumerDetails' }, // Capture for walk-ins
        },
      },
      { $sort: { totalGenerated: -1 } }, // Sort descending by revenue
      { $limit: 1 }, // Take only the top 1 client
      {
        // Lookup the client details from the 'clients' collection
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'clientDetails',
        },
      },
      { $unwind: { path: '$clientDetails', preserveNullAndEmptyArrays: true } }, // Flatten the array safely
    ]);

    const topClient =
      topClientAggregation.length > 0
        ? {
            id: topClientAggregation[0]._id,
            name: topClientAggregation[0].clientDetails?.name || topClientAggregation[0].consumerDetails?.name || 'Walk-in Consumer',
            email: topClientAggregation[0].clientDetails?.email || topClientAggregation[0].consumerDetails?.email || 'No Email',
            phone: topClientAggregation[0].clientDetails?.phone || topClientAggregation[0].consumerDetails?.phone || 'No Phone Number',
            address: topClientAggregation[0].clientDetails?.address || topClientAggregation[0].consumerDetails?.address || 'No Address',
            totalGenerated: topClientAggregation[0].totalGenerated,
            latestInvoiceNumber: topClientAggregation[0].latestInvoiceNumber
          }
        : null;

    // 3. Most Common Invoice Creation Day
    const commonDayAggregation = await Invoice.aggregate([
      { $match: { userId } },
      {
        $group: {
          // MongoDB $dayOfWeek returns 1 (Sunday) to 7 (Saturday)
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const mostCommonDay =
      commonDayAggregation.length > 0
        ? {
            day: daysOfWeek[commonDayAggregation[0]._id - 1], // Map 1-7 to Day Name
            count: commonDayAggregation[0].count,
          }
        : null;

    // 4. Revenue Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const revenueTrendAggregation = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'Draft' }, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueTrend = revenueTrendAggregation.map(item => ({
      name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: item.revenue
    }));

    // 5. Top Selling Products
    const topProductsAggregation = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'Draft' } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          sales: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 5 }
    ]);

    const topProducts = topProductsAggregation.map(item => ({
      name: item._id,
      sales: item.sales,
      revenue: item.revenue
    }));

    // 6. Invoice Status Distribution
    const statusAggregation = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'Draft' } } },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 }
        }
      }
    ]);

    const statusMap = { 'Paid': 0, 'Pending': 0, 'Overdue': 0 };
    statusAggregation.forEach(item => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.value;
      }
    });

    const invoiceStatusData = Object.keys(statusMap).map(key => ({
      name: key,
      value: statusMap[key]
    }));

    // 7. Inventory Distribution
    const inventoryStats = await Product.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          inStock: { $sum: { $cond: [{ $gt: ["$stock", 10] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 10] }] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
          totalQuantity: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      }
    ]);

    const inventoryDistData = inventoryStats.length > 0 ? [
      { name: 'In Stock', value: inventoryStats[0].inStock },
      { name: 'Low Stock', value: inventoryStats[0].lowStock },
      { name: 'Out of Stock', value: inventoryStats[0].outOfStock }
    ] : [
      { name: 'In Stock', value: 0 },
      { name: 'Low Stock', value: 0 },
      { name: 'Out of Stock', value: 0 }
    ];

    const totalStockQuantity = inventoryStats.length > 0 ? inventoryStats[0].totalQuantity : 0;
    const totalStockValue = inventoryStats.length > 0 ? inventoryStats[0].totalValue : 0;

    // 8. Top 5 Customers
    const topCustomersAggregation = await Invoice.aggregate([
      { $match: { userId, status: { $ne: 'Draft' } } },
      {
        $group: {
          _id: "$clientId",
          name: { $last: { $ifNull: ["$consumerDetails.name", "Walk-in Consumer"] } },
          invoices: { $sum: 1 },
          spent: { $sum: "$totalAmount" }
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: '_id',
          foreignField: '_id',
          as: 'clientDetails',
        },
      },
      { $unwind: { path: '$clientDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ["$clientDetails.name", "$name"] },
          invoices: 1,
          spent: 1
        }
      },
      { $sort: { spent: -1 } },
      { $limit: 5 }
    ]);

    const topCustomers = topCustomersAggregation.map(item => ({
      id: item._id,
      name: item.name,
      invoices: item.invoices,
      spent: item.spent
    }));

    // 9. Low Stock Products
    const lowStockProducts = await Product.find({
      userId,
      stock: { $lt: 10 },
    }).select('name stock unit').limit(5);

    const formattedLowStock = lowStockProducts.map(p => ({
      id: p._id,
      name: p.name,
      stock: p.stock,
      unit: p.unit || 'units'
    }));

    // 10. Expiring Products
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);
    
    const expiringProducts = await Product.find({
      userId,
      expiryDate: { 
        $gte: now, 
        $lte: fiveDaysFromNow 
      }
    }).select('name expiryDate').sort({ expiryDate: 1 }).limit(5);

    const formattedExpiring = expiringProducts.map(p => ({
      id: p._id,
      name: p.name,
      daysLeft: Math.ceil((new Date(p.expiryDate) - now) / (1000 * 60 * 60 * 24))
    }));

    // 11. Today's Invoices
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysInvoices = await Invoice.find({
      userId,
      createdAt: { $gte: startOfToday }
    });

    // 12. Recent Invoices
    const recentInvoices = await Invoice.find({ userId, status: { $ne: 'Draft' } })
      .populate('clientId', 'name')
      .sort({ date: -1 })
      .limit(5);

    const formattedRecentInvoices = recentInvoices.map(inv => ({
      id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      client: inv.clientId?.name || inv.consumerDetails?.name || 'Walk-in Consumer',
      amount: inv.totalAmount,
      status: inv.status,
      date: new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }));

    // Send the compiled insights payload
    res.status(200).json({
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        grandTotalRevenue,
        grandTotalPaid,
        grandTotalUnpaid,
        growthPercentage: revenueGrowthPercentage.toFixed(2),
        trend: revenueTrend
      },
      topClient,
      mostCommonDay,
      topProducts,
      invoiceStatusData,
      inventoryDistData,
      topCustomers,
      lowStockProducts: formattedLowStock,
      expiringProducts: formattedExpiring,
      recentInvoices: formattedRecentInvoices,
      todaysInvoicesCount: todaysInvoices.length,
      inventorySummary: {
        totalQuantity: totalStockQuantity,
        totalValue: totalStockValue
      }
    });
  } catch (error) {
    next(error);
  }
};
