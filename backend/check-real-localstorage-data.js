/**
 * 检查localStorage中的真实业务数据
 * 分析实际的物料、供应商、项目、基线等信息
 */

import fs from 'fs';
import path from 'path';

async function checkRealLocalStorageData() {
  console.log('🔍 检查localStorage中的真实业务数据...\n');

  // 检查前端项目中是否有数据文件
  const frontendPath = path.join(process.cwd(), '../ai-inspection-dashboard');
  
  console.log('📁 检查前端项目路径:', frontendPath);
  
  if (fs.existsSync(frontendPath)) {
    console.log('✅ 找到前端项目');
    
    // 查看数据目录
    const dataPath = path.join(frontendPath, 'src/data');
    if (fs.existsSync(dataPath)) {
      console.log('📂 数据目录存在:', dataPath);
      
      const files = fs.readdirSync(dataPath);
      console.log('📄 数据文件列表:', files);
      
      // 检查物料供应商映射文件
      const materialSupplierFile = path.join(dataPath, 'MaterialSupplierMap.js');
      if (fs.existsSync(materialSupplierFile)) {
        console.log('\n📋 分析MaterialSupplierMap.js文件...');
        const content = fs.readFileSync(materialSupplierFile, 'utf8');
        
        // 提取供应商信息
        const supplierMatches = content.match(/suppliers:\s*\[(.*?)\]/g);
        const allSuppliers = new Set();
        
        if (supplierMatches) {
          supplierMatches.forEach(match => {
            const suppliers = match.match(/'([^']+)'/g);
            if (suppliers) {
              suppliers.forEach(supplier => {
                allSuppliers.add(supplier.replace(/'/g, ''));
              });
            }
          });
        }
        
        console.log('🏢 实际供应商列表:');
        Array.from(allSuppliers).sort().forEach(supplier => {
          console.log(`   - ${supplier}`);
        });
        
        // 提取物料名称
        const materialMatches = content.match(/name:\s*'([^']+)'/g);
        const allMaterials = new Set();
        
        if (materialMatches) {
          materialMatches.forEach(match => {
            const material = match.match(/'([^']+)'/)[1];
            allMaterials.add(material);
          });
        }
        
        console.log('\n📦 实际物料列表:');
        Array.from(allMaterials).sort().forEach(material => {
          console.log(`   - ${material}`);
        });
        
        // 提取物料类别
        const categoryMatches = content.match(/category:\s*'([^']+)'/g);
        const allCategories = new Set();
        
        if (categoryMatches) {
          categoryMatches.forEach(match => {
            const category = match.match(/'([^']+)'/)[1];
            allCategories.add(category);
          });
        }
        
        console.log('\n🔧 实际物料类别:');
        Array.from(allCategories).sort().forEach(category => {
          console.log(`   - ${category}`);
        });
      }
      
      // 检查项目数据文件
      const projectDataFile = path.join(dataPath, 'ProjectData.js');
      if (fs.existsSync(projectDataFile)) {
        console.log('\n📊 分析ProjectData.js文件...');
        const content = fs.readFileSync(projectDataFile, 'utf8');
        
        // 提取项目信息
        const projectNameMatches = content.match(/"PJ\d+": "([^"]+)"/g);
        const allProjects = new Set();
        
        if (projectNameMatches) {
          projectNameMatches.forEach(match => {
            const project = match.match(/"([^"]+)"$/)[1];
            allProjects.add(project);
          });
        }
        
        console.log('📋 实际项目列表:');
        Array.from(allProjects).sort().forEach(project => {
          console.log(`   - ${project}`);
        });
        
        // 提取基线信息
        const baselineMatches = content.match(/"BL\d+": "([^"]+)"/g);
        const allBaselines = new Set();
        
        if (baselineMatches) {
          baselineMatches.forEach(match => {
            const baseline = match.match(/"([^"]+)"$/)[1];
            allBaselines.add(baseline);
          });
        }
        
        console.log('\n📐 实际基线列表:');
        Array.from(allBaselines).sort().forEach(baseline => {
          console.log(`   - ${baseline}`);
        });
        
        // 提取工厂信息
        const factoryMatches = content.match(/:\s*"([^"]*工厂)"/g);
        const allFactories = new Set();
        
        if (factoryMatches) {
          factoryMatches.forEach(match => {
            const factory = match.match(/"([^"]+)"/)[1];
            allFactories.add(factory);
          });
        }
        
        console.log('\n🏭 实际工厂列表:');
        Array.from(allFactories).sort().forEach(factory => {
          console.log(`   - ${factory}`);
        });
      }
      
      // 检查物料数据文件
      const materialDataFile = path.join(dataPath, 'MaterialData.js');
      if (fs.existsSync(materialDataFile)) {
        console.log('\n📋 分析MaterialData.js文件...');
        const content = fs.readFileSync(materialDataFile, 'utf8');
        
        // 提取缺陷类型
        const defectMatches = content.match(/:\s*\[(.*?)\]/g);
        const allDefects = new Set();
        
        if (defectMatches) {
          defectMatches.forEach(match => {
            const defects = match.match(/"([^"]+)"/g);
            if (defects) {
              defects.forEach(defect => {
                allDefects.add(defect.replace(/"/g, ''));
              });
            }
          });
        }
        
        console.log('\n⚠️ 实际缺陷类型列表:');
        Array.from(allDefects).sort().forEach(defect => {
          console.log(`   - ${defect}`);
        });
      }
    }
  } else {
    console.log('❌ 未找到前端项目');
  }
  
  console.log('\n🎉 真实业务数据分析完成！');
  console.log('\n💡 建议基于以上真实数据重新设计智能问答规则');
}

// 运行检查
checkRealLocalStorageData().catch(console.error);
