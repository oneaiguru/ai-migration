"""
Legacy GUI snippet placeholder.

The previous version of this file contained a partial code fragment that was not valid Python,
which broke `python -m compileall`. The original text is retained below for reference only and
is not executed by the application. If GUI functionality is required, integrate the snippet into
the main GUI module and remove this placeholder.
"""

LEGACY_SNIPPET = r"""
# Создание диалога для просмотра
                dialog = QDialog(self)
                dialog.setWindowTitle(f"Отчет: {os.path.basename(file_path)}")
                dialog.resize(800, 600)
                
                layout = QVBoxLayout(dialog)
                
                # Создание виджета для просмотра HTML
                from PyQt5.QtWebEngineWidgets import QWebEngineView
                web_view = QWebEngineView()
                web_view.setHtml(html_content)
                layout.addWidget(web_view)
                
                # Кнопка закрытия
                close_btn = QPushButton("Закрыть")
                close_btn.clicked.connect(dialog.close)
                layout.addWidget(close_btn)
                
                dialog.setLayout(layout)
                dialog.exec_()
                
            else:
                # Открытие файла через системные средства
                import subprocess
                import platform
                
                system = platform.system()
                
                if system == 'Darwin':  # macOS
                    subprocess.call(('open', file_path))
                elif system == 'Windows':
                    os.startfile(file_path)
                else:  # Linux
                    subprocess.call(('xdg-open', file_path))
                
        except Exception as e:
            QMessageBox.warning(
                self,
                "Открытие отчета",
                f"Ошибка открытия файла: {str(e)}"
            )
    
    def delete_report(self):
        \"\"\"Удаление выбранного отчета\"\"\"
        selected_rows = self.reports_table.selectionModel().selectedRows()
        
        if not selected_rows:
            QMessageBox.warning(
                self,
                "Удаление отчета",
                "Не выбран отчет для удаления"
            )
            return
        
        row = selected_rows[0].row()
        name_item = self.reports_table.item(row, 0)
        path_item = self.reports_table.item(row, 3)
        
        if name_item and path_item:
            file_name = name_item.text()
            file_path = path_item.text()
            
            reply = QMessageBox.question(
                self,
                "Удаление отчета",
                f"Вы уверены, что хотите удалить отчет '{file_name}'?\\n"
                f"Это действие нельзя отменить.",
                QMessageBox.Yes | QMessageBox.No,
                QMessageBox.No
            )
            
            if reply != QMessageBox.Yes:
                return
            
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    
                    # Обновление списка отчетов
                    self.load_reports()
                    
                    QMessageBox.information(
                        self,
                        "Удаление отчета",
                        f"Отчет '{file_name}' успешно удален"
                    )
                    
                    if self.logger:
                        self.logger.info(f"Удален отчет: {file_path}")
                else:
                    QMessageBox.warning(
                        self,
                        "Удаление отчета",
                        f"Файл не найден: {file_path}"
                    )
                    
            except Exception as e:
                QMessageBox.warning(
                    self,
                    "Удаление отчета",
                    f"Ошибка удаления файла: {str(e)}"
                )


class AboutDialog(QDialog):
    \"\"\"Диалог 'О программе'\"\"\"
    
    def __init__(self, parent=None):
        \"\"\"
        Инициализация диалога
        
        Args:
            parent: Родительский виджет
        \"\"\"
        super().__init__(parent)
        self.setWindowTitle(\"О программе\")
        self.setFixedSize(500, 400)
        self.init_ui()
    
    def init_ui(self):
        \"\"\"Инициализация интерфейса\"\"\"
        layout = QVBoxLayout()
        
        # Название и версия
        title_label = QLabel(\"iMessage Рассылка\")
        title_label.setAlignment(Qt.AlignCenter)
        title_font = QFont()
        title_font.setPointSize(18)
        title_font.setBold(True)
        title_label.setFont(title_font)
        layout.addWidget(title_label)
        
        version_label = QLabel(\"Версия 1.0.0\")
        version_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(version_label)
        
        # Разделитель
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setFrameShadow(QFrame.Sunken)
        layout.addWidget(line)
        
        # Описание
        description = QLabel(
            \"Система для автоматической рассылки сообщений через iMessage на macOS.\\n\\n\"
            \"Возможности:\\n\"
            \"- Загрузка контактов из различных форматов\\n\"
            \"- Шаблонизация сообщений\\n\"
            \"- Отправка сообщений с медиафайлами\\n\"
            \"- Гибкая настройка рассылки\\n\"
            \"- Подробное логирование и отчеты\\n\\n\"
            \"Автор: Михаил\"
        )
        description.setWordWrap(True)
        layout.addWidget(description)
        
        # Год
        year_label = QLabel(f\"© {datetime.datetime.now().year}\")
        year_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(year_label)
        
        # Кнопка закрытия
        close_btn = QPushButton(\"Закрыть\")
        close_btn.clicked.connect(self.close)
        layout.addWidget(close_btn)
        
        self.setLayout(layout)


class MainWindow(QMainWindow):
    \"\"\"Главное окно приложения\"\"\"
    
    def __init__(self):
        \"\"\"Инициализация главного окна\"\"\"
        super().__init__()
        
        # Инициализация конфигурации
        self.config = Config()
        
        # Загрузка конфигурации
        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json')
        if os.path.exists(config_path):
            self.config.load_from_file(config_path)
        
        # Инициализация логгера
        self.logger = Logger(
            log_path=self.config.get('log_path', 'logs'),
            log_level=self.config.get('log_level', 'info'),
            console=self.config.get('console_log', True)
        )
        
        # Инициализация компонентов
        self.contact_manager = ContactManager(logger=self.logger)
        self.template_manager = MessageTemplate(logger=self.logger)
        self.sender = iMessageSender(logger=self.logger, use_applescript=self.config.get('use_applescript', True))
        
        # Настройка окна
        self.setWindowTitle(\"iMessage Рассылка\")
        self.setMinimumSize(800, 600)
        self.setup_ui()
"""
