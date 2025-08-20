const express = require("express");
const archiver = require("archiver");
const fs = require("fs");
const Image = require("../models/media/image");
const Audio = require("../models/media/audio");
const Video = require("../models/media/video");
const DocumentTable = require("../models/media/document");
const Information = require("../models/information/information");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");

// Language translations for field labels
const translations = {
  EN: {
    sectionId: "Section",
    subject: "Subject",
    date: "Date",
    information_place: "Information Place",
    cityId: "City",
    countryId: "Country",
    governorateId: "Governorate",
    countyId: "County",
    regionId: "Region",
    streetId: "Street",
    villageId: "Village",
    addressDetails: "Address Details",
    credibility: "Credibility",
    infoStatus: "Information Status",
    sourceName: "Source Name",
    source_credibility: "Source Credibility",
    observation: "Observation",
    note: "Note",
    details: "Details",
    evaluation: "Evaluation",
    suggestion: "Suggestion",
    people: "People",
    coordinates: "Coordinates",
    closing: "Revolutionary Greetings",
  },
  KU: {
    sectionId: "Beş",
    subject: "Mijar",
    date: "Dîrok",
    information_place: "Cihê Agahiyê",
    cityId: "Bajar",
    countryId: "Welat",
    governorateId: "Parêzgeha",
    countyId: "Kant",
    regionId: "Herêm",
    streetId: "Rê",
    villageId: "Gund",
    addressDetails: "Hûrîyên navnîşanê",
    credibility: "Çavkanî",
    infoStatus: "Agahî",
    sourceName: "Navê Çavkanî",
    source_credibility: " Çavkanî",
    observation: "Nerîn",
    note: "Têbînî",
    details: "Hûr",
    evaluation: "Nirxandina",
    suggestion: "Pêşniyarî",
    people: "Kes",
    coordinates: "Koordîn",
    closing: "Silav û Rêzên Şoreşgerî",
  },
  AR: {
    sectionId: "القسم",
    subject: "الموضوع",
    date: "التاريخ",
    information_place: "مكان المعلومات",
    cityId: "المدينة",
    countryId: "الدولة",
    governorateId: "المحافظة",
    countyId: "المقاطعة",
    regionId: "المنطقة",
    streetId: "الشارع",
    villageId: "القرية",
    addressDetails: "تفاصيل العنوان",
    credibility: "المصداقية",
    infoStatus: "حالة المعلومة",
    sourceName: "اسم المصدر",
    source_credibility: "مصداقية المصدر",
    observation: "ملاحظة",
    note: "ملاحظة",
    details: "تفاصيل",
    evaluation: "تقييم",
    suggestion: "اقتراح",
    people: "الأشخاص",
    coordinates: "الإحداثيات",
    closing: "مع التحية الثورية",
  },
};

const downloadInforamtion = async (req, res) => {
  const { informationId } = req.body;
  const lang = req.body.lang || "EN"; // Default to English
  if (!translations[lang]) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const filesResult = await getFilesByInformationId(informationId);
  if (!filesResult.success) {
    return res.status(500).json({ error: filesResult.message });
  }

  const securityInfo = await Information.findById(informationId)
    .populate([
      { path: "sectionId", select: "name" },
      { path: "departmentId", select: "name" },
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governorateId", select: "name" },
      { path: "countyId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "events", select: "name" },
      { path: "parties", select: "name" },
      { path: "sources", select: "source_name source_credibility" },
      { path: "coordinates", select: "coordinates note" },
      { path: "people", select: "firstName surName image fatherName" },
    ])
    .lean();

  if (!securityInfo) {
    return res.status(404).json({ error: "Security information not found" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Mijara_Agahaiye.zip"'
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  // Add files to zip if they exist
  if (filesResult.files && filesResult.files.length > 0) {
    filesResult.files.forEach((file) => {
      const fullPath = path.join(__dirname, "..", file.url);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: path.basename(fullPath) });
      }
    });
  }

  // Build Word content
  const paragraphs = [];

  // Section
  if (securityInfo.sectionId) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["sectionId"]}: ${
              securityInfo.sectionId.name || ""
            }`,
            bold: true,
            size: 30,
          }),
        ],
        spacing: { after: 300 },
        rightToLeft: lang === "AR",
      })
    );
  }

  // Subject
  if (securityInfo.subject) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["subject"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({ text: securityInfo.subject, size: 30 }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }

  // Date
  if (securityInfo.date) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["date"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({
            text: new Date(securityInfo.date).toLocaleDateString("en-GB"),
            size: 30,
          }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }

  // Location fields (city, country, governorate, etc.)
  let informationPlace = "";
  [
    "countryId",
    "governorateId",
    "countyId",
    "cityId",
    "regionId",
    "streetId",
    "villageId",
  ].forEach((field) => {
    if (securityInfo[field]) {
      informationPlace += `${securityInfo[field].name}` || "";
    }
  });
  informationPlace -= ", ";
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${translations[lang]["information_place"]}: `,
          bold: true,
          size: 30,
        }),
        new TextRun({ text: informationPlace, size: 30 }),
      ],
      spacing: { after: 200 },
      rightToLeft: lang === "AR",
    })
  );

  // Address details
  if (securityInfo.addressDetails) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["addressDetails"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({ text: securityInfo.addressDetails, size: 30 }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }
  // add the sources.source_name single
  if (securityInfo.sources) {
    const sourcesStr = securityInfo.sources.source_name || "";
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["sourceName"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({ text: sourcesStr, size: 30 }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["source_credibility"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({
            text: securityInfo.sources.source_credibility || "",
            size: 30,
          }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }

  // Credibility styled as blue hyperlink
  if (securityInfo.credibility) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["credibility"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({
            text: securityInfo.credibility,
            color: "0563C1",
            underline: { type: "single" },
            size: 30,
          }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }

  // Note + Details in green
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: securityInfo["details"],
          bold: true,
          color: "000000",
          font: "Arial",
          size: 33,
        }),
      ],
      spacing: { after: 200 },
      rightToLeft: lang === "AR",
    })
  );

  // People
  if (securityInfo.people && securityInfo.people.length > 0) {
    const peopleStr = securityInfo.people
      .map((p) =>
        `${p.firstName || ""} ${p.fatherName || ""} ${p.surName || ""}`.trim()
      )
      .join(", ");
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["people"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({ text: peopleStr, size: 30 }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }

  // Coordinates
  if (securityInfo.coordinates && securityInfo.coordinates.length > 0) {
    const coordsStr = securityInfo.coordinates
      .map((c) => `(${c.coordinates || ""}) `)
      .join(",");
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["coordinates"]}: `,
            bold: true,
            size: 30,
          }),
          new TextRun({ text: coordsStr, size: 30 }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR",
      })
    );
  }
  ["note"].forEach((field) => {
    if (securityInfo[field]) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${translations[lang][field]}: `,
              bold: true,
              color: "008000",
              size: 30,
            }),
            new TextRun({ text: securityInfo[field], size: 30 }),
          ],
          spacing: { after: 200 },
          rightToLeft: lang === "AR",
        })
      );
    }
  });
  // Closing (bottom right)
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: translations[lang]["closing"],
          bold: true,
          size: 30,
        }),
      ],
      spacing: { before: 400 },
      rightToLeft: lang === "AR",
    })
  );

  // Signature name + dynamic date (createdAt)
  paragraphs.push(
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: req.user?.username || "System",
          break: 1,
          size: 30,
        }),
        new TextRun({
          text: new Date(securityInfo.createdAt).toLocaleDateString("en-GB"),
          size: 30,
        }),
      ],
      rightToLeft: lang === "AR",
    })
  );
  // Create doc
  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });
  const docBuffer = await Packer.toBuffer(doc);

  archive.append(docBuffer, { name: "Mijara_Agahaiye.docx" });
  archive.finalize();
};

const getFilesByInformationId = async (parentId) => {
  try {
    const images = await Image.find({ parentId });
    const audios = await Audio.find({ parentId });
    const videos = await Video.find({ parentId });
    const documents = await DocumentTable.find({ parentId });

    const files = [...images, ...audios, ...videos, ...documents].map(
      (file) => ({
        type: file.type,
        url: `/public${file.src}`,
      })
    );

    return { success: true, files };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = downloadInforamtion;
