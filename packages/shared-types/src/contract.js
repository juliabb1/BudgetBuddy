"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractDTO = void 0;
var zod_1 = require("zod");
var Cycle;
(function (Cycle) {
    Cycle[Cycle["MONTHLY"] = 0] = "MONTHLY";
    Cycle[Cycle["QUARTERLY"] = 1] = "QUARTERLY";
    Cycle[Cycle["HALF_YEARLY"] = 2] = "HALF_YEARLY";
    Cycle[Cycle["YEARLY"] = 3] = "YEARLY";
})(Cycle || (Cycle = {}));
var Category;
(function (Category) {
    Category[Category["INSURANCE"] = 0] = "INSURANCE";
    Category[Category["ENERGY"] = 1] = "ENERGY";
    Category[Category["INTERNET"] = 2] = "INTERNET";
    Category[Category["PHONE"] = 3] = "PHONE";
    Category[Category["STREAMING"] = 4] = "STREAMING";
    Category[Category["FOOD"] = 5] = "FOOD";
    Category[Category["TRANSPORT"] = 6] = "TRANSPORT";
    Category[Category["HEALTH"] = 7] = "HEALTH";
    Category[Category["EDUCATION"] = 8] = "EDUCATION";
    Category[Category["SUBSCRIPTION"] = 9] = "SUBSCRIPTION";
    Category[Category["OTHER"] = 10] = "OTHER";
})(Category || (Category = {}));
exports.ContractDTO = zod_1.default.object({
    id: zod_1.default.string(),
    userId: zod_1.default.string(),
    name: zod_1.default.string(),
    price: zod_1.default.number(),
    cycle: zod_1.default.enum(Cycle),
    startDate: zod_1.default.date(),
    endDate: zod_1.default.date().nullable().optional(),
    isActive: zod_1.default.boolean(),
    debitDayOfMonth: zod_1.default.number().min(1).max(28),
    category: zod_1.default.enum(Category)
});
