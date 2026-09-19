import { applyViews } from "./common/applyViews";
import { openDatabase } from './common/db';

const db = openDatabase();
try{
    await applyViews(db);
} finally {
    db.close();
}