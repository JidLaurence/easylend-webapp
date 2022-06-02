"use strict";

var Async = require("async"),
  Mongoose = require("mongoose");

//RELEASED
exports.searchForReportsReleased = function (
  company_id,
  staff_id,
  branchID,
  collectorID,
  start,
  end
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { createdAt: { $gte: start, $lt: end } },
        { isVoid: false },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { createdAt: { $gte: start, $lt: end } },
        { isVoid: false },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { createdAt: { $gte: start, $lt: end } },
        { isVoid: false },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { createdAt: { $gte: start, $lt: end } },
        { isVoid: false },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { createdAt: { $gte: start, $lt: end } },
        { isVoid: false },
      ],
    };
  }
  return condition;
};
exports.searchForReportsReleasedAll = function (
  company_id,
  staff_id,
  branchID,
  collectorID
) {
  var condition = {};
  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  }
  return condition;
};
exports.releasedByYear = function (
  company_id,
  staff_id,
  branchID,
  collectorID
) {
  var condition = {};
  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
      ],
    };
  }
  return condition;
};

//COLLECTED
exports.searchForReportsCollected = function (
  company_id,
  staff_id,
  branchID,
  collectorID,
  start,
  end
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { payAt: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { payAt: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { payAt: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { payAt: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { payAt: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  }
  return condition;
};
exports.searchForReportsCollectedAll = function (
  company_id,
  staff_id,
  branchID,
  collectorID
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  }
  return condition;
};
exports.collectedByYear = function (
  company_id,
  staff_id,
  branchID,
  collectorID,
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: true },
      ],
    };
  }
  return condition;
};

//BALANCE
exports.searchForReportsBalance = function (
  company_id,
  staff_id,
  branchID,
  collectorID,
  start,
  end
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  }
  return condition;
};
exports.searchForReportsBorrowed = function (
  company_id,
  staff_id,
  branchID,
  collectorID,
  start,
  end
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
        { date_accepted: { $gte: start, $lt: end } },
        { isStatus: "Accepted" },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { date_accepted: { $gte: start, $lt: end } },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { date_accepted: { $gte: start, $lt: end } },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { date_accepted: { $gte: start, $lt: end } },
        { isStatus: "Accepted" },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { date_accepted: { $gte: start, $lt: end } },
        { isStatus: "Accepted" },
      ],
    };
  }
  return condition;
};
exports.searchForReportsBalanceAll = function (
  company_id,
  staff_id,
  branchID,
  collectorID
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isPaid: false },
        { isStatus: "Accepted" },
      ],
    };
  }
  return condition;
};
exports.searchForReportsBorrowredAll = function (
  company_id,
  staff_id,
  branchID,
  collectorID
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  }
  return condition;
};
//ACCEPTED
exports.searchForReportsAcceptedCustomer = function (
  company_id,
  staff_id,
  branchID,
  collectorID,
  start,
  end
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { date_accepted: { $gte: start, $lt: end } },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  }
  return condition;
};
exports.searchForReportsAcceptedCustomerAll = function (
  company_id,
  staff_id,
  branchID,
  collectorID
) {
  var condition = {};

  if(parseInt(staff_id)==0){
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  }else if (parseInt(branchID) == 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) == 0 && parseInt(collectorID) != 0) {
    condition = {
      $and: [
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else if (parseInt(branchID) != 0 && parseInt(collectorID) == 0) {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  } else {
    condition = {
      $and: [
        { branch_id: Mongoose.Types.ObjectId(branchID) },
        { collector_id: Mongoose.Types.ObjectId(collectorID) },
        { company_id: Mongoose.Types.ObjectId(company_id) },
        { staff_id: Mongoose.Types.ObjectId(staff_id) },
        { isVoid: false },
        { isStatus: "Accepted" },
      ],
    };
  }
  return condition;
};

//HELPEERS
exports.filterByMonth = function (result, year) {
  var x = {
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    june: 0,
    july: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
  };

  result.forEach((data) => {
    if (data.year == year) {
      switch (data.month) {
        case 1:
          x.jan += data.amount;
          break;
        case 2:
          x.feb += data.amount;
          break;
        case 3:
          x.mar += data.amount;
          break;
        case 4:
          x.apr += data.amount;
          break;
        case 5:
          x.may += data.amount;
          break;
        case 6:
          x.june += data.amount;
          break;
        case 7:
          x.july += data.amount;
          break;
        case 8:
          x.aug += data.amount;
          break;
        case 9:
          x.sep += data.amount;
          break;
        case 10:
          x.oct += data.amount;
          break;
        case 11:
          x.nov += data.amount;
          break;
        case 12:
          x.dec += data.amount;
          break;
      }
    }
  });
  return x;
};
