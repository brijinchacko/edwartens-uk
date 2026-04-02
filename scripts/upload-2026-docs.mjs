import { execSync } from "child_process";
import { readdirSync, statSync } from "fs";
import { join, basename, extname } from "path";

const SSH_KEY = `${process.env.HOME}/.ssh/seekof_deploy`;
const SERVER = "root@72.62.230.223";
const REMOTE_PATH = "/var/www/edwartens-uk/uploads/documents";
const BASE_DIR = `${process.env.HOME}/Applications/EDWARTENS UK/2026`;

const STUDENT_MAP = {
  "Jan/Daniel Olaseinde": "cmnbewnpx00hz110b4hrakzb4",
  "Jan/Jenis Vinoth Kumar": "cmnbewnpb00hh110bvwdxf9yt",
  "Jan/Jijo": "cmnbewnpn00hq110bre9j9eu3",
  "Jan/Krishna kumar kasinathadurai": "cmnbewnp400h8110bfoa4tnaa",
  "Jan/Naveen Telson Puthezhath": "cmnbewnp900he110b9iqjb654",
  "Feb/Hemanth": "cmnbewnqb00ib110bkcd488ft",
  "Feb/Mullaivendan Nagarajan": "cmnbewnq000i2110blg522bj0",
  "March/Abin Antony": "cmnbewnqq00in110b6cqryzmd",
  "March/Aron": "cmnbewnr600iw110bgpg7nm1e",
  "March/Jishnu Kaliyathan Moorkoth": "cmnbewnqj00ih110b6r2ga0q5",
  "March/Junemol Devassykutty": "cmnbewnqt00iq110belnk80wh",
  "March/Neeraj Lal Alakkal Mohan": "cmnbewnqx00it110b0ltviffx",
  "March/Rafeek Rasool": "cmnbewnqm00ik110b0aipacg1",
};

function classifyDoc(filename) {
  const lower = filename.toLowerCase();
  if (/cv|resume/.test(lower)) return "CV";
  if (/certificate|cert|degree|qualification|marksheet|education|consolidated/.test(lower)) return "QUALIFICATION";
  if (/brp|passport|visa|share.code|evisa|pic|photo|id proof/.test(lower)) return "ID_PROOF";
  return "OTHER";
}

function getFilesRecursive(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        results.push(...getFilesRecursive(fullPath));
      } else {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

function run(cmd) {
  return execSync(cmd, { encoding: "utf-8", timeout: 30000 }).trim();
}

function sqlExec(sql) {
  // Write SQL to a temp file on server to avoid quoting hell
  const tmpFile = `/tmp/edw_sql_${Date.now()}.sql`;
  // Escape single quotes for the echo command
  const safeSql = sql.replace(/'/g, "'\\''");
  run(`ssh -i "${SSH_KEY}" ${SERVER} "echo '${safeSql}' > ${tmpFile}"`);
  try {
    const result = run(
      `ssh -i "${SSH_KEY}" ${SERVER} "cd /var/www/edwartens-uk && PGPASSWORD=\\$(grep DATABASE_URL .env | sed 's/.*:\\/\\/[^:]*:\\([^@]*\\)@.*/\\1/') psql -h localhost -U \\$(grep DATABASE_URL .env | sed 's/.*:\\/\\/\\([^:]*\\):.*/\\1/') -d edwartens_uk -t -A -f ${tmpFile}"`
    );
    run(`ssh -i "${SSH_KEY}" ${SERVER} "rm -f ${tmpFile}"`);
    return result;
  } catch (err) {
    run(`ssh -i "${SSH_KEY}" ${SERVER} "rm -f ${tmpFile}"`);
    throw err;
  }
}

let total = 0;
let uploaded = 0;

for (const [folderKey, studentId] of Object.entries(STUDENT_MAP)) {
  const folderPath = join(BASE_DIR, folderKey);
  const files = getFilesRecursive(folderPath);

  if (files.length === 0) {
    console.log(`SKIP: No files in ${folderKey}`);
    continue;
  }

  console.log(`\n=== ${folderKey} (${studentId}) — ${files.length} files ===`);

  for (const filepath of files) {
    const filename = basename(filepath);
    if (filename.startsWith(".")) continue; // skip hidden files

    const docType = classifyDoc(filename);
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const uniqueName = `${studentId}-2026-${safeName}`;
    const remotePath = `${REMOTE_PATH}/${uniqueName}`;
    const dbFilePath = `/uploads/documents/${uniqueName}`;

    try {
      // Upload file
      run(`scp -i "${SSH_KEY}" -q "${filepath}" "${SERVER}:${remotePath}"`);

      // Create Document record
      const escapedName = filename.replace(/'/g, "''");
      const docId = `doc_2026_${Math.random().toString(36).slice(2, 14)}`;
      sqlExec(
        `INSERT INTO "Document" (id, "studentId", name, type, "filePath", status, "uploadedAt") VALUES ('${docId}', '${studentId}', '${escapedName}', '${docType}', '${dbFilePath}', 'UPLOADED', NOW()) ON CONFLICT DO NOTHING;`
      );

      console.log(`  ✅ ${filename} (${docType})`);
      uploaded++;
    } catch (err) {
      console.log(`  ❌ ${filename}: ${err.message?.slice(0, 80)}`);
    }
    total++;
  }
}

console.log(`\n=== DONE: ${uploaded}/${total} files uploaded ===`);

// Now check remaining students with 0 docs
console.log("\n=== 2026 Students still without documents ===");
const result = sqlExec(
  `SELECT u.name, b.name FROM "Student" s JOIN "User" u ON s."userId" = u.id LEFT JOIN "Batch" b ON s."batchId" = b.id WHERE b.name LIKE '%2026%' AND (SELECT COUNT(*) FROM "Document" d WHERE d."studentId" = s.id) = 0 ORDER BY b."startDate" DESC, u.name;`
);
if (result) {
  console.log(result);
} else {
  console.log("None — all 2026 students have documents!");
}
