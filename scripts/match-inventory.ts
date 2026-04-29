import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function main() {
  const lines = fs.readFileSync('/tmp/list.txt', 'utf-8').trim().split('\n');
  const list = lines.map(l => { const [n, q] = l.split('|'); return { name: n.trim(), qty: parseInt(q) }; });

  const wines = await prisma.wine.findMany({ select: { id: true, name: true, stock: true } });
  const byNorm = new Map<string, typeof wines>();
  for (const w of wines) {
    const k = normalize(w.name);
    if (!byNorm.has(k)) byNorm.set(k, [] as any);
    byNorm.get(k)!.push(w);
  }

  const matched: { listName: string; dbName: string; id: string; oldStock: number; newStock: number }[] = [];
  const unmatchedList: string[] = [];
  const matchedIds = new Set<string>();

  for (const item of list) {
    const k = normalize(item.name);
    let cands = byNorm.get(k);
    if (!cands) {
      // try partial: db name contains all words of list name OR list normalized matches db normalized
      cands = wines.filter(w => normalize(w.name) === k);
    }
    if (!cands || cands.length === 0) {
      // try fuzzy: db normalized starts with or contains list normalized as whole
      const listN = k;
      cands = wines.filter(w => {
        const wn = normalize(w.name);
        return wn === listN;
      });
    }
    if (!cands || cands.length === 0) {
      unmatchedList.push(item.name);
      continue;
    }
    if (cands.length > 1) {
      console.log(`AMBIGUOUS list "${item.name}" -> ${cands.map(c=>c.name).join(', ')}`);
    }
    for (const c of cands) {
      matchedIds.add(c.id);
      matched.push({ listName: item.name, dbName: c.name, id: c.id, oldStock: c.stock, newStock: item.qty });
    }
  }

  const toDelete = wines.filter(w => !matchedIds.has(w.id));

  console.log('\n=== MATCHED (' + matched.length + ') ===');
  for (const m of matched) console.log(`  ${m.listName} -> ${m.dbName} (stock ${m.oldStock} -> ${m.newStock})`);
  console.log('\n=== UNMATCHED FROM LIST (' + unmatchedList.length + ') ===');
  for (const n of unmatchedList) console.log('  ' + n);
  console.log('\n=== DB WINES TO DELETE (' + toDelete.length + ') ===');
  for (const w of toDelete) console.log(`  ${w.name} (stock ${w.stock})`);

  await prisma.$disconnect();
}
main();
