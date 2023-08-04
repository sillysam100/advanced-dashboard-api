import Joi from "joi";
import { privateRoute } from "../../middlewares/auth";
import { Request, Response, Router } from "express";
import Customer from "../../models/iiicustomers/Customer";

const router = Router();

function validateCustomer(customer: Object) {
  const schema = Joi.object({
    firstName: Joi.string().allow("").optional(),
    lastName: Joi.string().allow("").optional(),
    businessName: Joi.string().allow("").optional(),
    address: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    fax: Joi.string().allow("").optional(),
    storage: Joi.number().optional(),
    archived: Joi.boolean().default(false),
    estimatedWealth: Joi.string().optional(),
    amountSwindled: Joi.string().optional(),
    perceivedPriority: Joi.number().optional(),
  });

  return schema.validate(customer);
}

router.get("/", privateRoute, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(500).json({ message: "Internal server error" });
    }
    const customers = await Customer.find();
    return res.json(customers);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", privateRoute, async (req: Request, res: Response) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = new Customer(req.body);
    await customer.save();
    return res.status(201).json(customer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", privateRoute, async (req: Request, res: Response) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    Object.assign(customer, req.body);

    await customer.save();

    return res.status(200).json(customer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:id", privateRoute, async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    await customer.deleteOne();

    return res.status(200).json(customer);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
