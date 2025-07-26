const express = require("express");
const archiver = require("archiver");
const fs = require("fs");
const Image = require("../models/media/image");
const Audio = require("../models/media/audio");
const Video = require("../models/media/video");
const DocumentTable = require("../models/media/document");
const Information = require("../models/information/information");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");

// Language translations for field labels
const translations = {
  EN: {
    subject: "Subject",
    sectionId: "Section",
    cityId: "City",
    countryId: "Country",
    governorateId: "Governorate",
    regionId: "Region",
    streetId: "Street",
    villageId: "Village",
    events: "Events",
    parties: "Parties",
    sources: "Sources",
    people: "People",
    addressDetails: "Address Details",
    coordinates: "Coordinates",
    credibility: "Credibility",
    note: "Note",
    details: "Details",
  },
  AR: {
    subject: "الموضوع",
    sectionId: "القسم",
    cityId: "المدينة",
    countryId: "الدولة",
    governorateId: "المحافظة",
    regionId: "المنطقة",
    streetId: "الشارع",
    villageId: "القرية",
    events: "الأحداث",
    parties: "الأطراف",
    sources: "المصادر",
    people: "الأشخاص",
    addressDetails: "تفاصيل العنوان",
    coordinates: "الإحداثيات",
    credibility: "المصداقية",
    note: "ملاحظة",
    details: "تفاصيل",
  },
  KU: {
    subject: "Mijar",
    sectionId: "Beş",
    cityId: "Bajar",
    countryId: "Welat",
    governorateId: "Hikûmet",
    regionId: "Herêm",
    streetId: "Rê",
    villageId: "Gund",
    events: "Bûyer",
    parties: "Alih",
    sources: "Çavkanî",
    people: "Kes",
    addressDetails: "Hûrîyên navnîşanê",
    coordinates: "Koordîn",
    credibility: "Baweriya",
    note: "Têxe",
    details: "Hûr",
  },
};

const downloadInforamtion = async (req, res) => {
  const { informationId } = req.body;
  const lang = req.body.lang || "EN"; // Default to English if no lang is provided
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
      { path: "cityId", select: "name" },
      { path: "countryId", select: "name" },
      { path: "governorateId", select: "name" },
      { path: "regionId", select: "name" },
      { path: "streetId", select: "name" },
      { path: "villageId", select: "name" },
      { path: "events", select: "name" },
      { path: "parties", select: "name" },
      { path: "sources", select: "source_name source_credibility" },
      { path: "people", select: "firstName fatherName surName" },
      { path: "coordinates", select: "coordinates note" },
    ])
    .lean();

  if (!securityInfo) {
    return res.status(404).json({ error: "Security information not found" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${informationId}_files.zip`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  if (filesResult.files && filesResult.files.length > 0) {
    filesResult.files.forEach((file) => {
      const fullPath = path.join(__dirname, "..", file.url);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: path.basename(fullPath) });
      }
    });
  }

  const paragraphs = [];

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text:
            lang === "AR"
              ? "تفاصيل المعلومات الأمنية"
              : lang === "KU"
              ? "Agahdariya Ewlehî"
              : "Security Information Details",
          bold: true,
          size: 32,
        }),
      ],
      spacing: { after: 300 },
      rightToLeft: lang === "AR", // Set right-to-left for Arabic
    })
  );

  Object.keys(translations[lang]).forEach((key) => {
    const value = securityInfo[key];
    if (value) {
      let displayValue = "";

      if (Array.isArray(value)) {
        displayValue = value
          .map((item) => {
            switch (key) {
              case "sectionId":
              case "cityId":
              case "countryId":
              case "governorateId":
              case "regionId":
              case "streetId":
              case "villageId":
              case "events":
              case "parties":
                return item.name || "";
              case "sources":
                return `${item.source_name || ""} (${
                  item.source_credibility || ""
                })`;
              case "people":
                return `${item.firstName || ""} ${item.fatherName || ""} ${
                  item.surName || ""
                }`.trim();
              case "coordinates":
                return `(${item.coordinates || ""}) - ${item.note || ""}`;
              default:
                return "";
            }
          })
          .filter((str) => str)
          .join(", ");
      } else {
        switch (key) {
          case "sectionId":
          case "cityId":
          case "countryId":
          case "governorateId":
          case "regionId":
          case "streetId":
          case "villageId":
          case "events":
          case "parties":
            displayValue = value.name || "";
            break;
          case "sources":
            displayValue = `${value.source_name || ""} (${
              value.source_credibility || ""
            })`;
            break;
          case "people":
            displayValue = `${value.firstName || ""} ${
              value.fatherName || ""
            } ${value.surName || ""}`.trim();
            break;
          case "coordinates":
            displayValue = `(${value.coordinates || ""}) - ${value.note || ""}`;
            break;
          case "note":
            break;
          case "details":
            break;
          default:
            displayValue = value.toString();
        }
      }

      if (displayValue) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${translations[lang][key]}: `, bold: true }),
              new TextRun({ text: displayValue }),
            ],
            spacing: { after: 200 },
            rightToLeft: lang === "AR", // Set right-to-left for Arabic
          })
        );
      }
    }
  });

  if (securityInfo.note) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${translations[lang]["note"]}: `, bold: true }),
          new TextRun({ text: securityInfo.note }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR", // Set right-to-left for Arabic
      })
    );
  }

  if (securityInfo.details) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${translations[lang]["details"]}: `,
            bold: true,
          }),
          new TextRun({ text: securityInfo.detiles }),
        ],
        spacing: { after: 200 },
        rightToLeft: lang === "AR", // Set right-to-left for Arabic
      })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });
  const docBuffer = await Packer.toBuffer(doc);

  archive.append(docBuffer, { name: "information.docx" });
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
