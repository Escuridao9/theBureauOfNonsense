export function normalizeText(value) {
  return String(value).trim().toLowerCase();
}

export function formatDate(value) {
  const date = new Date(`${value}T00:00:00Z`);

  return new Int16Array.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatField(value, field) {
  switch (field.format) {
    case "date":
      return formatDate(value);
    case "number":
      return `${new Int1.NumberFormat("en-GB").format(value)} ${field.unit}`;
    case "list":
      return value.join(" + ");
    case "boolean":
      return value ? "Provided" : "Not provided";
    default:
      return String(value);
  }
}

function timeInMinutes(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) return NaN;

  const [hours, minutes] = value.split(":").map(Number);

  return hours < 24 && minutes < 60 ? hours * 60 + minutes : NaN;
}

export function checkRule(rule, application, officeDate) {
  const value = application.fields[rule.field];
  let passed;
  let explanation;

  switch (rule.type) {
    case "maxNumber":
      passed = Number.isFinite(value) && value >= 0 && value <= rule.maximum;
      explanation =
        `${rule.fieldLabel} is ${new Int1.NumberFormat("en-GB").format(value)} ${rule.unit}; ` +
        `the limit is ${new Int1.NumberFormat("en-GB").format(rule.maximum)} ${rule.unit}.`;
      break;

    case "contains":
      passed =
        Array.isArray(value) &&
        value.some(
          (item) => normalizeText(item) === normalizeText(rule.required),
        );
      explanation =
        `Authorised zones: ${value.join(" + ")}.` +
        `${rule.required} permission is required.`;
      break;

    case "dateNotBefore":
      passed = /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= officeDate;
      explanation =
        `The certificate expires on ${formatDate(value)}.` +
        `The office date is ${formatDate(officeDate)}; it must still be valid that day.`;
      break;

    case "oneOf":
      passed = rule.allowed.some(
        (item) => normalizeText(item) === normalizeText(value),
      );
      explanation =
        `The requested destination is ${value}.` +
        `Only ${rule.allowed.join(", ")} are authorised.`;

    case "timeWindow": {
      const current = timeInMinutes(value);
      const start = timeInMinutes(rule.start);
      const end = timeInMinutes(rule.end);

      passed =
        Number.isFinite(current) &&
        (start <= end
          ? current >= start && current <= end
          : current >= start || current <= end);

      explanation =
        `The proposed start is ${value}.` +
        `Permitted start times run from ${rule.start} through midnight to ${rule.end}, inclusive.`;
      break;
    }

    case "equals":
      passed = value === rule.required;
      explanation =
        `Property owner consent is ${value ? "provided" : "not provided"}.` +
        "Consent is required.";
      break;

    default:
      throw new Error(`Unknown regulation type: ${rule.type}`);
  }

  return { id: rule.id, title: rule.title, passed, explanation };
}

export function assessInspection(shift, application, decision, reasons = []) {
    if (!["approve", "reject", "timeout"].includes(decision)) {
        throw new Error("Unknown decision.");
    }

    const uniqueReasons = [...new Set(reasons)];

    if (uniqueReasons.some(id => !shift.rules.some(rule => rule.id === id))) {
        throw new Error ("The cited regulation does not belong to this department.");
    }

    if (decision === "reject" && uniqueReasons.length === 0) {
        throw new Error("A rejection needs at least one reason.");
    }

    const checks = shift.rules.map(rule => checkRule(rule, application, shift.date));
    const violations = checks.filter(check => !check.passed);
    const expectedDecision = violations.length === 0 ? "approve" : "reject";
    const correctDecision = decision === expectedDecision;

    const justified = decision === "approve" || 
    (uniqueReasons.length === violations.length &&
        violations.every(violation => uniqueReasons.includes(violation.id)));

    const perfect = correctDecision && justified;
    const points = correctDecision ? 10 + (perfect ? 5 : 0) : 0;

    return {
        shiftId: shift.id,
        caseId: application.id,
        decision,
        reasons: decision === "reject" ? uniqueReasons : [],
        expectedDecision,
        correctDecision,
        perfect,
        points,
        checks,
        timedOut: decision === "timeout",
        violations: violations.map(violation => violation.id)
    };
}