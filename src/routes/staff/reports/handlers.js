"use strict";

const { isEmpty, xor } = require("lodash");

var internals = {},
  Crypto = require("../../../lib/Crypto"),
  Helpers = require("../../../lib/Helpers"),
  Cryptos = require("crypto"),
  _ = require("lodash"),
  moment = require("moment"),
  Async = require("async"),
  Nodemailer = require("nodemailer"),

  Users = require("../../../database/models/users"),
  Branches = require("../../../database/models/branches"),
  Staffs = require("../../../database/models/staff"),
  Settings = require("../../../database/models/settings"),
  Capitals = require("../../../database/models/capitals"),
  Collectors = require("../../../database/models/collectors"),
  Calendars = require("../../../database/models/calendars"),
  Customers = require("../../../database/models/customers"),
  Collect_dates = require("../../../database/models/collect_dates"),
  Collects = require("../../../database/models/collects"),
  Releases = require("../../../database/models/releases"),
  
  moment = require("moment");

internals.index = async function (req, reply) {

  var today = new Date();

  const company_id = req.auth.credentials.company_id;
  const staff_id = req.auth.credentials._id;
  const branchID = 0;
  const collectorID = 0;
  const year = today.getFullYear();
  let start = new Date(req.query.startDate);
  let end = new Date(req.query.endDate);

  let getreleased={};
  let getcollected={};
  let getbalance={};
  let getborrowed={}
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);


  const releasedCondtion = Helpers.searchForReportsReleasedAll(company_id, staff_id, branchID, collectorID);
  const collectedCondtion = Helpers.searchForReportsCollectedAll(company_id, staff_id, branchID, collectorID);
  const balanceCondtion = Helpers.searchForReportsBalanceAll(company_id, staff_id, branchID, collectorID);
  const borroweredCondtion = Helpers.searchForReportsBorrowredAll(company_id, staff_id, branchID, collectorID);
  const customerAcceptedCondition = Helpers.searchForReportsAcceptedCustomerAll(company_id, staff_id, branchID, collectorID);
  const releasedByYearCondition = Helpers.releasedByYear(company_id, staff_id, branchID, collectorID);
  const collectedByYearCondition = Helpers.collectedByYear(company_id, staff_id, branchID, collectorID);

  try{
    
    //GET BRANCH OF THIS USER
    let myBranch = await Staffs.find({
      staff_id: staff_id,
      company_id: company_id
    })
    .populate('branch_id')
    .lean();



    //TOTAL AMOUNT OF RELEASED
    let released = await Releases.aggregate([
      {
        $match: releasedCondtion
       },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            total: { $sum: "$amount" }
          }
       }
     ]);
     //TOTAL AMOUNT OF COLLECTS
     let collected = await Collects.aggregate([
      {
        $match: collectedCondtion
       },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            total: { $sum: "$amount" }
          }
       }
     ]);
    //TOTAL BORROWERED OF CUSTOMER
    let borrowed = await Customers.aggregate([
      {
        $match: borroweredCondtion
        },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            capital: { $sum: "$capital" },
            capital_total: { $sum: "$capital_total" }
          }
        }
      ]);
     //TOTAL BALANCE OF CUSTOMER
     let balance = await Customers.aggregate([
      {
        $match: balanceCondtion
       },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            total: { $sum: "$balance" }
          }
       }
     ]);
     //COUNT ACCEPTED CUSTOMER
     let customerCnt = await Customers.countDocuments(
      customerAcceptedCondition
     ).lean();
      //GET RELEASED BY MONTH
     let releasedByMonth = await Releases.find(
      releasedByYearCondition
     ).lean();
    //GET COLLECTED BY MONTH
     let collectedByMonth = await Collects.find(
      collectedByYearCondition
     ).lean();
  
     if(releasedByMonth!=null){
      releasedByMonth = Helpers.filterByMonth(releasedByMonth, year);
     }
     if(collectedByMonth!=null){
      collectedByMonth = Helpers.filterByMonth(collectedByMonth, year);
     }

    
     if(released[0]){
      getreleased = {
        total: released[0].total,
        cnt: released[0].cnt
      }
    }else{
      getreleased = {
        total: 0,
        cnt: 0
      }
    }
    if(borrowed[0]){
      getborrowed ={
        cnt: borrowed[0].cnt,
        capital:borrowed[0].capital,
        capital_total: borrowed[0].capital_total,
      }
    }else{
      getborrowed ={
        cnt: 0,
        capital:0,
        capital_total: 0
      }
    }
    if(collected[0]){
      getcollected = {
        total: collected[0].total?collected[0].total:0,
        cnt: collected[0].cnt?collected[0].cnt:0,
      }
    }else{
      getcollected = {
        total:0,
        cnt: 0,
      }
    }
    if(balance[0]){
      getbalance = {
        total: balance[0].total?balance[0].total:0,
        cnt: balance[0].cnt?balance[0].cnt:0,
      }
    }else{
      getbalance = {
        total:0,
        cnt: 0
      }
    }
    console.log(myBranch);
    reply.view("staff/reports/index.html", {
      released: getreleased,
      collected:getcollected,
      balance:getbalance,
      borrowed: getborrowed,
      customerCnt: customerCnt?customerCnt:0,
      releasedByMonth,
      collectedByMonth,

      selectedYear: year,
      myBranch:myBranch,

      selectedBranch: 'All Branch',
      selectedCollector: 'All Collector',
      selectedDateStarted: 'All Date',
      selectedDateEnd: 'All Date',
      selectedYear: year
    });
  }catch(error){
    console.log(error)
    return reply.redirect("/staff/reports?message=Error, try again!&alertType=error");
  }
};

internals.search = async function (req, reply) {

  const company_id = req.auth.credentials.company_id;
  const staff_id = req.auth.credentials._id;

  const branchID = req.query.branch_id;
  const collectorID = req.query.collector_id;
  const year = req.query.year;
  let start = new Date(req.query.startDate);
  let end = new Date(req.query.endDate);

  let getreleased={};
  let getcollected={};
  let getbalance={};
  let getborrowed={}
  let myBranch={};
  let myCollector={};

  let branchName='All Branch';
  let collectorName='All Collector';

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const releasedCondtion = Helpers.searchForReportsReleased(company_id, staff_id, branchID, collectorID, start, end);
  const collectedCondtion = Helpers.searchForReportsCollected(company_id, staff_id, branchID, collectorID, start, end);
  const balanceCondtion = Helpers.searchForReportsBalance(company_id, staff_id, branchID, collectorID, start, end);
  const borrowedCondtion = Helpers.searchForReportsBorrowed(company_id, staff_id, branchID, collectorID, start, end);
  const customerAcceptedCondition = Helpers.searchForReportsAcceptedCustomer(company_id, staff_id, branchID, collectorID, start, end);
  const releasedByYearCondition = Helpers.releasedByYear(company_id, staff_id, branchID, collectorID);
  const collectedByYearCondition = Helpers.collectedByYear(company_id, staff_id, branchID, collectorID);

  //VERIFY INPUT
  if(isEmpty(branchID)|| isEmpty(collectorID)|| isEmpty(year) || isEmpty(req.query.startDate) || isEmpty(req.query.endDate)){
    return reply.redirect("/staff/reports?message=Error, Please fillup the form correctly!&alertType=error");
  }

  try{
    //GET BRANCH OF THIS USER
    myBranch = await Staffs.find({
      staff_id: staff_id,
      company_id: company_id
    })
    .populate('branch_id')
    .lean();

    if(parseInt(branchID)!=0){
      let oneBranch = await Branches.findOne({
          _id: branchID,
          company_id: company_id
        })
        .lean();

        if(oneBranch==null){
          branchName='Not found';
        }else{
          branchName=oneBranch.name;
        }
    }

    if(parseInt(collectorID)!=0){
      let oneCollector = await Collectors.findOne({
        collector_id: collectorID,
        staff_id: staff_id,
        company_id: company_id
      })
      .populate('collector_id')
      .lean();
      if(oneCollector==null){
        collectorName='Not found';
      }else{
        collectorName=oneCollector.collector_id.firstname + ' ' + oneCollector.collector_id.lastname;
      }
    }
    
    console.log('MY BRANCH ', myBranch);
    //GET COLLECTOR OF THIS USER
    if(parseInt(collectorID)!=0){
      myCollector = await Collectors.findOne({
        collector_id: collectorID,
        staff_id: staff_id,
        company_id: company_id
      })
      .populate('collector_id')
      .lean();
    }
    console.log('MY COLLECTOR ', myCollector);
    //TOTAL AMOUNT OF RELEASED
    let released = await Releases.aggregate([
      {
        $match: releasedCondtion
       },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            total: { $sum: "$amount" }
          }
       }
     ]);

    //TOTAL BORROWERED OF CUSTOMER
    let borrowed = await Customers.aggregate([
      {
        $match: borrowedCondtion
        },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            capital: { $sum: "$capital" },
            capital_total: { $sum: "$capital_total" }
          }
        }
      ]);
     //TOTAL AMOUNT OF COLLECTS
     let collected = await Collects.aggregate([
      {
        $match: collectedCondtion
       },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            total: { $sum: "$amount" }
          }
       }
     ]);
     //TOTAL BALANCE OF CUSTOMER
     let balance = await Customers.aggregate([
      {
        $match: balanceCondtion
       },{
          $group: {
            _id: null,
            cnt: { $sum: 1 },
            total: { $sum: "$balance" }
          }
       }
     ]);
     //COUNT ACCEPTED CUSTOMER
     let customerCnt = await Customers.countDocuments(
      customerAcceptedCondition
     ).lean();
      //GET RELEASED BY MONTH
     let releasedByMonth = await Releases.find(
      releasedByYearCondition
     ).lean();
    //GET COLLECTED BY MONTH
     let collectedByMonth = await Collects.find(
      collectedByYearCondition
     ).lean();
  
     if(releasedByMonth!=null){
      releasedByMonth = Helpers.filterByMonth(releasedByMonth, year);
     }
     if(collectedByMonth!=null){
      collectedByMonth = Helpers.filterByMonth(collectedByMonth, year);
     }

    if(released[0]){
      getreleased = {
        total: released[0].total,
        cnt: released[0].cnt
      }
    }else{
      getreleased = {
        total: 0,
        cnt: 0
      }
    }
    if(borrowed[0]){
      getborrowed ={
        cnt: borrowed[0].cnt,
        capital:borrowed[0].capital,
        capital_total: borrowed[0].capital_total,
      }
    }else{
      getborrowed ={
        cnt: 0,
        capital:0,
        capital_total: 0
      }
    }
    if(collected[0]){
      getcollected = {
        total: collected[0].total?collected[0].total:0,
        cnt: collected[0].cnt?collected[0].cnt:0,
      }
    }else{
      getcollected = {
        total:0,
        cnt: 0,
      }
    }
    if(balance[0]){
      getbalance = {
        total: balance[0].total?balance[0].total:0,
        cnt: balance[0].cnt?balance[0].cnt:0,
      }
    }else{
      getbalance = {
        total:0,
        cnt: 0
      }
    }
 
    console.log(branchName, collectorName);
    reply.view("staff/reports/index.html", {
      released: getreleased,
      collected:getcollected,
      balance:getbalance,
      borrowed: getborrowed,
      customerCnt: customerCnt?customerCnt:0,
      releasedByMonth,
      collectedByMonth,

      selectedYear: year,
      myBranch: myBranch,

      selectedBranch: branchName,
      selectedCollector: collectorName,

      selectedDateStarted: req.query.startDate,
      selectedDateEnd: req.query.endDate,
      selectedYear: year
    });
  }catch(error){
    console.log(error)
    return reply.redirect("/staff/reports?message=Error, try again!&alertType=error");
  }
};
module.exports = internals;
